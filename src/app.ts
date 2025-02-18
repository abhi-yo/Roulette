import { Casino, Player, GameResult } from './index.js';

class CasinoUI {
    private casino: Casino;
    private player: Player;
    private elements!: {
        playerName: HTMLElement;
        playerBalance: HTMLElement;
        slotReels: HTMLElement;
        rouletteNumber: HTMLElement;
        message: HTMLElement;
        slotBet: HTMLInputElement;
        rouletteBet: HTMLInputElement;
        betType: HTMLSelectElement;
        betNumber: HTMLInputElement;
    };

    constructor() {
        this.casino = new Casino();
        this.player = this.casino.addPlayer('John Doe', 1000);
        this.initializeElements();
        this.addEventListeners();
        this.updateDisplay();
    }

    private initializeElements() {
        this.elements = {
            playerName: document.getElementById('playerName')!,
            playerBalance: document.getElementById('playerBalance')!,
            slotReels: document.getElementById('slotReels')!,
            rouletteNumber: document.getElementById('rouletteNumber')!,
            message: document.getElementById('message')!,
            slotBet: document.getElementById('slotBet') as HTMLInputElement,
            rouletteBet: document.getElementById('rouletteBet') as HTMLInputElement,
            betType: document.getElementById('betType') as HTMLSelectElement,
            betNumber: document.getElementById('betNumber') as HTMLInputElement,
        };
    }

    private addEventListeners() {
        document.getElementById('playSlots')?.addEventListener('click', () => this.playSlots());
        document.getElementById('playRoulette')?.addEventListener('click', () => this.playRoulette());
        
        // Show/hide number input based on bet type
        this.elements.betType.addEventListener('change', () => {
            this.elements.betNumber.style.display = 
                this.elements.betType.value === 'number' ? 'block' : 'none';
        });
    }

    private updateDisplay() {
        this.elements.playerName.textContent = this.player.name;
        this.elements.playerBalance.textContent = this.player.balance.toString();
    }

    private showMessage(message: string, isError: boolean = false) {
        this.elements.message.textContent = message;
        this.elements.message.className = `message ${isError ? 'error' : 'success'}`;
    }

    private async playSlots() {
        try {
            const bet = parseInt(this.elements.slotBet.value);
            const result = this.casino.playSlots(this.player.id, bet);
            
            // Animate slots
            const reels = Array.from(this.elements.slotReels.children);
            reels.forEach((reel, index) => {
                setTimeout(() => {
                    reel.textContent = result.symbols[index];
                }, index * 500);
            });

            this.updateDisplay();
            this.showMessage(
                result.won 
                    ? `Congratulations! You won $${result.amount}!` 
                    : `You lost $${-result.amount}. Try again!`
            );
        } catch (error) {
            this.showMessage(error instanceof Error ? error.message : 'An error occurred', true);
        }
    }

    private playRoulette() {
        try {
            const bet = parseInt(this.elements.rouletteBet.value);
            const betType = this.elements.betType.value as 'red' | 'black' | 'number';
            const betValue = parseInt(this.elements.betNumber.value);

            const result = this.casino.playRoulette(this.player.id, bet, betType, betValue);
            
            // Animate roulette number
            let count = 0;
            const interval = setInterval(() => {
                this.elements.rouletteNumber.textContent = 
                    Math.floor(Math.random() * 37).toString();
                count++;
                if (count > 20) {
                    clearInterval(interval);
                    this.elements.rouletteNumber.textContent = result.number.toString();
                }
            }, 100);

            this.updateDisplay();
            this.showMessage(
                result.won 
                    ? `Congratulations! You won $${result.amount}!` 
                    : `You lost $${-result.amount}. Try again!`
            );
        } catch (error) {
            this.showMessage(error instanceof Error ? error.message : 'An error occurred', true);
        }
    }
}

// Initialize the UI when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new CasinoUI();
});