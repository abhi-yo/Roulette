// Export interfaces
export interface Player {
  id: string;
  name: string;
  balance: number;
}

export interface GameResult {
  won: boolean;
  amount: number;
  newBalance: number;
}

// Export classes
export class SlotMachine {
  public static readonly symbols = ['🍒', '🍊', '🍋', '🎰', '💎', '7️⃣'];
  
  static spin(bet: number, player: Player): GameResult & { symbols: string[] } {
    if (bet > player.balance) {
      throw new Error('Insufficient funds');
    }

    const reels = Array.from({ length: 3 }, () => 
      this.symbols[Math.floor(Math.random() * this.symbols.length)]
    );

    const isWin = reels.every(symbol => symbol === reels[0]);
    const winAmount = isWin ? bet * 3 : 0;
    const newBalance = player.balance - bet + winAmount;

    return {
      won: isWin,
      amount: winAmount - bet,
      newBalance,
      symbols: reels
    };
  }
}

export class Roulette {
  static spin(bet: number, player: Player, betType: 'red' | 'black' | 'number', betValue: number): GameResult & { number: number } {
    if (bet > player.balance) {
      throw new Error('Insufficient funds');
    }

    const number = Math.floor(Math.random() * 37); // 0-36
    const isRed = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36].includes(number);
    
    let won = false;
    let multiplier = 0;

    if (betType === 'red' && isRed) {
      won = true;
      multiplier = 2;
    } else if (betType === 'black' && !isRed && number !== 0) {
      won = true;
      multiplier = 2;
    } else if (betType === 'number' && number === betValue) {
      won = true;
      multiplier = 35;
    }

    const winAmount = won ? bet * multiplier : 0;
    const newBalance = player.balance - bet + winAmount;

    return {
      won,
      amount: winAmount - bet,
      newBalance,
      number
    };
  }
}

export class Casino {
  private players: Map<string, Player> = new Map();

  addPlayer(name: string, initialBalance: number): Player {
    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      balance: initialBalance
    };
    this.players.set(player.id, player);
    return player;
  }

  getPlayer(id: string): Player | undefined {
    return this.players.get(id);
  }

  updatePlayerBalance(playerId: string, newBalance: number): void {
    const player = this.players.get(playerId);
    if (player) {
      player.balance = newBalance;
    }
  }

  playSlots(playerId: string, bet: number): GameResult & { symbols: string[] } {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const result = SlotMachine.spin(bet, player);
    this.updatePlayerBalance(playerId, result.newBalance);
    return result;
  }

  playRoulette(
    playerId: string, 
    bet: number, 
    betType: 'red' | 'black' | 'number', 
    betValue: number
  ): GameResult & { number: number } {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const result = Roulette.spin(bet, player, betType, betValue);
    this.updatePlayerBalance(playerId, result.newBalance);
    return result;
  }
}
