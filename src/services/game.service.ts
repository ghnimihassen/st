import { Game } from '../models/Game.model';
import { GamePlay } from '../models/GamePlay.model';
import { Client } from '../models/Client.model';
import { LoyaltyTransaction } from '../models/LoyaltyTransaction.model';
import { Types } from 'mongoose';

// Type pour les récompenses de jeu
interface GameReward {
  id: string;
  name: string;
  points: number;
  probability: number;
  color: string;
}

// Type pour le résultat de canPlayGame
interface CanPlayResult {
  canPlay: boolean;
  reason?: string;
}

export const GameService = {
  async getAllGames() {
    return await Game.find().lean();
  },

  async getGameById(id: string) {
    return await Game.findById(id).lean();
  },

  async getGameByType(type: string) {
    return await Game.findOne({ type }).lean();
  },

  async createGame(data: any) {
    // Empêcher la création d'un jeu avec un type déjà existant
    const existing = await Game.findOne({ type: data.type });
    if (existing) {
      throw new Error(`Game with type ${data.type} already exists`);
    }
    const game = new Game(data);
    await game.save();
    return game.toObject();
  },

  async updateGame(id: string, updates: any) {
    return await Game.findByIdAndUpdate(id, updates, { new: true, lean: true });
  },

  async deleteGame(id: string) {
    const result = await Game.findByIdAndDelete(id);
    return !!result;
  },

  // ✅ Mise à jour par type avec upsert (crée si n'existe pas)
  async updateGameByType(type: string, updates: any) {
    const game = await Game.findOneAndUpdate(
      { type },
      { ...updates, type, updatedAt: new Date() },
      { new: true, lean: true, upsert: true }  // upsert = true → crée si inexistant
    );
    return game;
  },

  // ✅ Suppression par type
  async deleteGameByType(type: string) {
    const result = await Game.findOneAndDelete({ type });
    return !!result;
  },

  async canPlayGame(clientId: string, gameType: string): Promise<CanPlayResult> {
    // Vérifier si le jeu existe et est actif
    const game = await Game.findOne({ type: gameType });
    if (!game) {
      return { canPlay: false, reason: 'Game not found' };
    }
    if (!game.enabled) {
      return { canPlay: false, reason: 'Game is disabled' };
    }
    
    // Vérifier les horaires
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < game.startHour || currentHour >= game.endHour) {
      return { canPlay: false, reason: `Game available from ${game.startHour}:00 to ${game.endHour}:00` };
    }
    
    // Vérifier la limite quotidienne
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const playsToday = await GamePlay.countDocuments({
      clientId: new Types.ObjectId(clientId),
      gameType,
      playedAt: { $gte: today }
    });
    
    if (playsToday >= game.maxPlaysPerDay) {
      return { canPlay: false, reason: `Daily limit reached (${game.maxPlaysPerDay} plays per day)` };
    }
    
    // Vérifier les points requis
    const client = await Client.findById(clientId);
    if (!client) {
      return { canPlay: false, reason: 'Client not found' };
    }
    
    const clientPoints = client.loyaltyPoints ?? 0;
    if (clientPoints < game.minPointsRequired) {
      return { canPlay: false, reason: `Insufficient points (need ${game.minPointsRequired} points)` };
    }
    
    return { canPlay: true };
  },

  async playGame(clientId: string, gameType: string) {
    // Vérifier si le client peut jouer
    const canPlayResult = await this.canPlayGame(clientId, gameType);
    if (!canPlayResult.canPlay) {
      throw new Error(canPlayResult.reason);
    }
    
    const game = await Game.findOne({ type: gameType });
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Sélectionner une récompense aléatoire basée sur les probabilités
    const rewards = game.rewards as GameReward[];
    const totalProb = rewards.reduce((sum, r) => sum + (r.probability || 0), 0);
    let random = Math.random() * totalProb;
    let selectedReward = rewards[rewards.length - 1];
    
    for (const reward of rewards) {
      if (random <= (reward.probability || 0)) {
        selectedReward = reward;
        break;
      }
      random -= (reward.probability || 0);
    }
    
    const isWin = (selectedReward?.points || 0) > 0;
    const prize = isWin && selectedReward ? {
      type: 'points' as const,
      value: selectedReward.points,
      description: selectedReward.name
    } : undefined;
    
    // Enregistrer la partie
    const gamePlay = new GamePlay({
      clientId: new Types.ObjectId(clientId),
      gameType,
      result: isWin ? 'win' : 'lose',
      prize,
      playedAt: new Date(),
    });
    await gamePlay.save();
    
    // Ajouter les points si le client a gagné
    if (isWin && selectedReward && selectedReward.points > 0) {
      const client = await Client.findById(clientId);
      if (client) {
        const pointsToAdd = selectedReward.points;
        client.loyaltyPoints = (client.loyaltyPoints || 0) + pointsToAdd;
        client.lifetimePoints = (client.lifetimePoints || 0) + pointsToAdd;
        await client.save();
        
        // Enregistrer la transaction
        const transaction = new LoyaltyTransaction({
          clientId: client._id,
          type: 'game_win',
          points: pointsToAdd,
          description: `Gagné au jeu ${game.name}: ${selectedReward.name}`,
        });
        await transaction.save();
      }
    }
    
    return gamePlay.toObject();
  },

  async getGameHistory(clientId: string, limit: number = 20) {
    return await GamePlay.find({ clientId: new Types.ObjectId(clientId) })
      .sort({ playedAt: -1 })
      .limit(limit)
      .lean();
  },

  async getGameStats(gameType?: string) {
    const filter: any = {};
    if (gameType) filter.gameType = gameType;
    
    const totalPlays = await GamePlay.countDocuments(filter);
    const totalWins = await GamePlay.countDocuments({ ...filter, result: 'win' });
    const totalLosses = await GamePlay.countDocuments({ ...filter, result: 'lose' });
    
    // Statistiques par jour
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const playsToday = await GamePlay.countDocuments({ ...filter, playedAt: { $gte: today } });
    
    // Répartition des résultats
    const winsByGame = await GamePlay.aggregate([
      { $match: filter },
      { $group: {
          _id: '$gameType',
          wins: { $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] } },
          losses: { $sum: { $cond: [{ $eq: ['$result', 'lose'] }, 1, 0] } },
          total: { $sum: 1 }
        }
      }
    ]);
    
    return {
      totalPlays,
      totalWins,
      totalLosses,
      winRate: totalPlays > 0 ? (totalWins / totalPlays) * 100 : 0,
      playsToday,
      winsByGame,
    };
  },

  async resetDailyPlays() {
    // Cette méthode peut être utilisée par un cron job
    // Pour réinitialiser les compteurs journaliers
    // Dans cette implémentation, on utilise la date dans les requêtes
    return { success: true, message: 'Daily plays are calculated based on date filters' };
  },
};