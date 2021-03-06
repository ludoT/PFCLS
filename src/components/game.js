import {inject} from 'aurelia-framework';
import {Router} from 'aurelia-router';
import {conf} from './../conf';


@inject(Router, conf)

export class game {
	constructor(router, conf) {
		console.log('game constructor');
		this.disableState = 'disabled';
		this.disableState_startBtn = '';
		this.nbTurn = 3;
		this.toursRestant = this.nbTurn;
		this.timeGame = 3;
		this.tempsRestant = this.timeGame;
		this.scoreBoard = { joueur1: [], joueur2: [], score: {joueur1: 0, joueur2: 0, nul: 0}, winner: []};
		this.currentPlayer = 'joueur1';
		this.router = router;
		this.gameVM = this;
		this.conf = conf;
		this.showResult_cls = 'hidden';
		this.defaultClsButt = "btn btn-primary btn-lg symbole ";
	}
	
	activate(params){
		console.log('game - activate');
		this.toursRestant = params.nbManche;
		console.log(params); 
	}
	
	afficheBilanPartie(){
	    
	}
	
	startTimer(){
		this.toogleStartButt(false);
		this.toogleGameButt(true);
		var vitesseTimer = 0.01;
		this.tempsRestant = this.timeGame;
		this.refInterval = setInterval( () => {
			if( this.tempsRestant <= 0 ){
				this.currentPlayerTimeOut();
			}else{
				this.tempsRestant = (this.tempsRestant - vitesseTimer).toFixed(2);
			}
		}, vitesseTimer*1000);
	}
	
	resetTimer(){
		this.toogleGameButt(false);
		clearInterval(this.refInterval);
		this.tempsRestant = this.timeGame;
		this.toogleStartButt(true);
	}
	
	goToHome(){
		alert('Une erreur est survenue. Veuillez nous en excuser svp.');
		this.router.navigate('home');
	}
	
	setPlayerChoice(choice){
		alert('Game not started - return to Home');	//	To override
	}
	currentPlayerTimeOut(){
		
	}
	
	startButtClick() {
	    if( this.toursRestant > 0 ){
            if ( this.showResult_cls !== 'hidden' ){
                this.showResult_cls = 'hidden';
            }
            if( this.refTimeoutShowResult ){
                clearInterval(this.refTimeoutShowResult);
            }
            if( this.currentPlayer === 'joueur1' )
                this.startTurn();
            this.startTimer();
        }else{
            this.afficheBilanPartie();
        }
	}
	//	PHASE DE JEU
	startTurn(){
		if( this.toursRestant > 0 ){
			var player1_startTurn = new Promise( (resolve, reject) => {
				//	initialisation du tour du premier joueur
				console.log('promise1 - :'+this.toursRestant);
				this.setPlayerChoice = (choice) => {
					this.resetTimer();
					this.scoreBoard[this.currentPlayer].push(choice);
					resolve();
				};
				this.currentPlayerTimeOut = () => {
					this.resetTimer();
					this.scoreBoard[this.currentPlayer].push('');
					reject();
				};
			});
			console.log('joueur 1 PLAY');
			player1_startTurn.then(
				() => {
					//	joueur 2 joue
					console.log('joueur 2 PLAY');
					var player2_startTurn = new Promise( (resolve, reject) => {
						console.log('promise2 - :'+this.toursRestant);
						this.currentPlayer = 'joueur2';
						this.setPlayerChoice = (choice) => {
							this.resetTimer();
							this.scoreBoard[this.currentPlayer].push(choice);
							resolve();
						}
						this.currentPlayerTimeOut = () => {
							this.resetTimer();
							this.scoreBoard[this.currentPlayer].push('');
							reject();
						};
					});
					player2_startTurn.then( 
						() => {
							this.updateScore();
						}
					);
				},
				() => {
					this.goToHome();
				}
			);
		}else{
			this.setPlayerChoice = () => {console.log(this.scoreBoard)};
		}
		
		////////////	START TURN FUNCTIONS	//////////////
		
	}
	
	toogleGameButt(activate){
		activate ? this.disableState = '' : this.disableState = 'disabled';
	}
	toogleStartButt(activate){
		activate ? this.disableState_startBtn = '' : this.disableState_startBtn = 'disabled';
	}
	
	updateScore(){
		console.log('updateScore');
		this.currentPlayer = 'joueur1';
		this.toursRestant--;
		this.lastChoice_j1 = this.scoreBoard.joueur1[this.scoreBoard.joueur1.length - 1];
		this.lastChoice_j2 = this.scoreBoard.joueur2[this.scoreBoard.joueur2.length - 1];
		
		console.log(this.lastChoice_j1);
		console.log(this.lastChoice_j2);
		
		var winner = this.conf.getWinner( this.lastChoice_j1, this.lastChoice_j2 );
		console.log(winner);
		var winnerTxt = "";
		if( winner === 1 ){
			winnerTxt = "Le joueur 1 gagne";
			this.scoreBoard.score.joueur1++;
		}else if( winner === 2 ){
			this.scoreBoard.score.joueur2++;
			winnerTxt = "Le joueur 2 gagne";
		}else if( winner === 0 ){
			this.scoreBoard.score.nul++;
			winnerTxt = "Egualit&eacute;";
		}
		this.winnerTxt = winnerTxt;
		
		this.lastChoice_j1 = this.defaultClsButt+this.lastChoice_j1;
		this.lastChoice_j2 = this.defaultClsButt+this.lastChoice_j2;
		this.showResult_cls = 'showResult';
		this.refTimeoutShowResult = setTimeout( () => {
			this.startButtClick();
		}, 20000 );
		
	}
	/* configureRouter(config, router) {
		config.map([
		  { route: ['', 'j1Play'], name: 'welcome',       moduleId: 'welcome',       nav: true, title: 'Welcome' },
		  { route: 'j2Play',         name: 'users',         moduleId: 'users',         nav: true, title: 'Github Users' },
		  { route: 'child-router',  name: 'child-router',  moduleId: 'child-router',  nav: true, title: 'Child Router' }
		]);

		this.router = router;
	} */
}