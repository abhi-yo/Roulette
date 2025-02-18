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

const MAX_BET = 1000000; // $1M max bet
const MIN_BET = 1; // $1 min bet
const MIN_INITIAL_BALANCE = 10; // $10 minimum initial balance

export class SlotMachine {
  public static readonly symbols = ['🍒', '🍊', '🍋', '🎰', '💎', '7️⃣'];
  private static readonly payoutTable = new Map([
    ['7️⃣', 5], // 5x payout for triple 7s
    ['💎', 4], // 4x for triple diamonds
    ['🎰', 3], // 3x for triple slots
    ['🍒', 2], // 2x for triple cherries
    ['🍊', 2], // 2x for triple oranges
    ['🍋', 2], // 2x for triple lemons
  ]);
  
  static validateBet(bet: number, player: Player): void {
    if (bet <= 0) {
      throw new Error('Bet must be greater than 0');
    }
    if (bet > MAX_BET) {
      throw new Error(`Maximum bet is ${MAX_BET}`);
    }
    if (bet < MIN_BET) {
      throw new Error(`Minimum bet is ${MIN_BET}`);
    }
    if (bet > player.balance) {
      throw new Error('Insufficient funds');
    }
  }

  static spin(bet: number, player: Player): GameResult & { symbols: string[] } {
    this.validateBet(bet, player);

    const reels = Array.from({ length: 3 }, () => 
      this.symbols[Math.floor(Math.random() * this.symbols.length)]
    );

    const isWin = reels.every(symbol => symbol === reels[0]);
    const multiplier = isWin ? this.payoutTable.get(reels[0]) ?? 2 : 0;
    const winAmount = bet * multiplier;
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
  private static readonly redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  
  static validateBet(bet: number, player: Player, betType: 'red' | 'black' | 'number', betValue: number): void {
    if (bet <= 0) {
      throw new Error('Bet must be greater than 0');
    }
    if (bet > MAX_BET) {
      throw new Error(`Maximum bet is ${MAX_BET}`);
    }
    if (bet < MIN_BET) {
      throw new Error(`Minimum bet is ${MIN_BET}`);
    }
    if (bet > player.balance) {
      throw new Error('Insufficient funds');
    }
    if (betType === 'number' && (betValue < 0 || betValue > 36)) {
      throw new Error('Invalid number bet: must be between 0 and 36');
    }
  }

  static spin(bet: number, player: Player, betType: 'red' | 'black' | 'number', betValue: number): GameResult & { number: number } {
    this.validateBet(bet, player, betType, betValue);

    const number = Math.floor(Math.random() * 37); // 0-36
    const isRed = this.redNumbers.includes(number);
    
    let won = false;
    let multiplier = 0;

    // Handle all cases explicitly
    if (number === 0) {
      won = betType === 'number' && betValue === 0;
      multiplier = won ? 35 : 0;
    } else if (betType === 'red') {
      won = isRed;
      multiplier = won ? 2 : 0;
    } else if (betType === 'black') {
      won = !isRed;
      multiplier = won ? 2 : 0;
    } else if (betType === 'number') {
      won = number === betValue;
      multiplier = won ? 35 : 0;
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
  private readonly transactionLog: Array<{
    timestamp: Date;
    playerId: string;
    gameType: 'slots' | 'roulette';
    bet: number;
    result: GameResult;
  }> = [];

  validateInitialBalance(balance: number): void {
    if (balance <= 0) {
      throw new Error('Initial balance must be greater than 0');
    }
    if (balance < MIN_INITIAL_BALANCE) {
      throw new Error(`Minimum initial balance is ${MIN_INITIAL_BALANCE}`);
    }
  }

  addPlayer(name: string, initialBalance: number): Player {
    if (!name || name.trim().length === 0) {
      throw new Error('Player name is required');
    }
    
    this.validateInitialBalance(initialBalance);

    const player: Player = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
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
      if (newBalance < 0) {
        throw new Error('Balance cannot be negative');
      }
      player.balance = newBalance;
    }
  }

  private logTransaction(playerId: string, gameType: 'slots' | 'roulette', bet: number, result: GameResult): void {
    this.transactionLog.push({
      timestamp: new Date(),
      playerId,
      gameType,
      bet,
      result
    });
  }

  playSlots(playerId: string, bet: number): GameResult & { symbols: string[] } {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const result = SlotMachine.spin(bet, player);
    this.updatePlayerBalance(playerId, result.newBalance);
    this.logTransaction(playerId, 'slots', bet, result);
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
    this.logTransaction(playerId, 'roulette', bet, result);
    return result;
  }

  getTransactionHistory(playerId: string): Array<{
    timestamp: Date;
    gameType: 'slots' | 'roulette';
    bet: number;
    result: GameResult;
  }> {
    return this.transactionLog.filter(log => log.playerId === playerId);
  }
}