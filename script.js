'use strict'

// トランプのスートと値を定義
const suits = ['heart', 'diamond', 'spade', 'club'];
const values = ['1', '2', '3', '4', '5', '6', '7'];

// ゲームの初期設定
let deck = [];
let players = [
    { name: 'プレイヤー', hand: [], isHuman: true },
    { name: 'コンピュータ', hand: [], isHuman: false }
];

// 賭け金とコインの初期化
let betmoney = 0;
let coin = 10;

// ボタンにイベントリスナーを登録
document.getElementById('exchange-button').addEventListener('click', exchangeCards);
document.getElementById('exchange-none-button').addEventListener('click', () => {
    document.getElementById('exchange-button').classList.add('hidden');
    document.getElementById('exchange-none-button').classList.add('hidden');
    document.getElementById('bet-button').classList.add('hidden');
    
    computerExchangeCards(); // コンピュータのカードを交換
    revealHands(); // 手札を公開
});
document.getElementById('bet-button').addEventListener('click', bet);
document.getElementById('next-game-button').addEventListener('click', () => {
    document.getElementById('next-game-button').classList.add('hidden');
    startGame();
});

// 役の強さを定義する定数
const HAND_RANKS = {
    HIGH_CARD: 1,
    ONE_PAIR: 2,
    TWO_PAIR: 3,
    THREE_OF_A_KIND: 4,
    STRAIGHT: 5,
    FLUSH: 6,
    FULL_HOUSE: 7,
    FOUR_OF_A_KIND: 8,
    STRAIGHT_FLUSH: 9
};

startGame();

// ゲームを開始する関数
function startGame() {
    document.getElementById('exchange-button').classList.remove('hidden');
    document.getElementById('bet-button').classList.remove('hidden');

    deck = createDeck(); // 新しいデッキを作成
    shuffleDeck(deck); // デッキをシャッフル
    dealCards(); // プレイヤーにカードを配る
    renderHands(); // 手札を画面に描画

    betmoney = 0; // 賭け金をリセット
    updateBetDisplay(); // UIを更新

    // 勝者の結果をクリア
    document.getElementById('player-result').innerHTML = '';
    document.getElementById('computer-result').innerHTML = '';
    document.getElementById('winner-result').innerHTML = '';
}

// 賭け金の表示を更新する関数
function updateBetDisplay() {
    document.getElementById('bet-money').textContent = 'ベット額: ' + betmoney;
    document.getElementById('current-coin').textContent = coin;
}

// デッキを作成する関数
function createDeck() {
    return suits.flatMap(suit => values.map(value => ({ suit, value })));
}

// デッキをシャッフルする関数
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // カードを交換
    }
}

// 各プレイヤーにカードを5枚配る関数
function dealCards() {
    players.forEach(player => {
        player.hand = deck.splice(-5, 5); // デッキから5枚ずつ配る
    });
}

// プレイヤーの手札を画面に描画する関数
function renderHands() {
    players.forEach(player => {
        const handElement = document.getElementById(player.isHuman ? 'player-hand' : 'computer-hand');
        handElement.innerHTML = '';
        player.hand.forEach(card => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.style.backgroundImage = player.isHuman ? `url('images/${card.value}_${card.suit}.png')` : 'url("images/back.png")';

            if (player.isHuman) {
                // 人間プレイヤーはカードを選択可能
                cardElement.addEventListener('click', () => {
                    cardElement.classList.toggle('selected');
                    updateExchangeButtons(); // ボタンの表示を更新
                });
            }

            handElement.appendChild(cardElement);
        });
    });

    updateExchangeButtons(); // 初期状態を確認
}

// カード選択に応じて「交換する」ボタンと「交換しない」ボタンを切り替える
function updateExchangeButtons() {
    const selectedCards = document.querySelectorAll('#player-hand .selected');
    if (selectedCards.length > 0) {
        document.getElementById('exchange-button').classList.remove('hidden');
        document.getElementById('exchange-none-button').classList.add('hidden');
    } else {
        document.getElementById('exchange-button').classList.add('hidden');
        document.getElementById('exchange-none-button').classList.remove('hidden');
    }
}

// プレイヤーが選択したカードを交換する関数
function exchangeCards() {
    document.getElementById('exchange-button').classList.add('hidden');
    document.getElementById('exchange-none-button').classList.add('hidden');
    document.getElementById('bet-button').classList.add('hidden');
    const selectedCards = document.querySelectorAll('#player-hand .selected');

    // 選択されたカードにフェードアウト効果を追加
    selectedCards.forEach(cardElement => {
        cardElement.classList.add('fade-out');
    });

    setTimeout(() => {
        selectedCards.forEach(cardElement => {
            const index = Array.from(cardElement.parentNode.children).indexOf(cardElement);
            players[0].hand[index] = deck.pop(); // デッキから新しいカードを引く
            cardElement.classList.remove('fade-out', 'selected');
            cardElement.style.backgroundImage = `url('images/${players[0].hand[index].value}_${players[0].hand[index].suit}.png')`;
            cardElement.classList.add('fade-in'); // フェードイン効果を追加
        });
    }, 250);

    setTimeout(() => {
        renderHands(); // 手札を再描画
        computerExchangeCards(); // コンピュータのカードを交換
        revealHands(); // 手札を公開
    }, 2000);
}

// コンピュータのカード交換ロジック
function computerExchangeCards() {
    const computer = players[1];
    const valueCounts = countValues(computer.hand);

    computer.hand = computer.hand.map(card => {
        // ペア以上を残す
        return Object.values(valueCounts).some(count => count > 1) && valueCounts[card.value] > 1 ? card : deck.pop();
    });
}

// コンピュータの手札を公開し、勝者を決定する関数
function revealHands() {
    const computerHandElement = document.getElementById('computer-hand');
    computerHandElement.innerHTML = '';
    
    players[1].hand.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.style.backgroundImage = `url('images/${card.value}_${card.suit}.png')`;
        computerHandElement.appendChild(cardElement);
    });

    document.getElementById('exchange-button').classList.add('hidden');
    document.getElementById('exchange-none-button').classList.add('hidden');

    setTimeout(() => {
        determineWinner(); // 勝者を判定
    }, 1000);
}

// カードの数値を取得
function cardValue(card) {
    return parseInt(card.value, 10);
}

// 手札内のカードの値をカウント
function countValues(cards) {
    const valueCount = {};
    cards.forEach(card => {
        const value = cardValue(card);
        valueCount[value] = (valueCount[value] || 0) + 1;
    });
    return valueCount;
}

// 手札がフラッシュかを確認
function isFlush(cards) {
    return new Set(cards.map(card => card.suit)).size === 1;
}

// 手札がストレートかを確認
function isStraight(cards) {
    const values = cards.map(cardValue).sort((a, b) => a - b);
    return values.every((val, index) => index === 0 || (val === values[index - 1] + 1));
}

// 手札の役を判定
function determineRank(hand) {
    const valueCounts = countValues(hand);
    const values = Object.values(valueCounts);

    if (isFlush(hand) && isStraight(hand)) return HAND_RANKS.STRAIGHT_FLUSH;
    if (values.includes(4)) return HAND_RANKS.FOUR_OF_A_KIND;
    if (values.includes(3) && values.includes(2)) return HAND_RANKS.FULL_HOUSE;
    if (isFlush(hand)) return HAND_RANKS.FLUSH;
    if (isStraight(hand)) return HAND_RANKS.STRAIGHT;
    if (values.includes(3)) return HAND_RANKS.THREE_OF_A_KIND;
    if (values.filter(count => count === 2).length === 2) return HAND_RANKS.TWO_PAIR;
    if (values.includes(2)) return HAND_RANKS.ONE_PAIR;

    return HAND_RANKS.HIGH_CARD;
}

// 手役の名称を取得する関数
function getHandRankName(rank) {
    switch(rank) {
        case HAND_RANKS.STRAIGHT_FLUSH: return 'ストレートフラッシュ';
        case HAND_RANKS.FOUR_OF_A_KIND: return '４カード';
        case HAND_RANKS.FULL_HOUSE: return 'フルハウス';
        case HAND_RANKS.FLUSH: return 'フラッシュ';
        case HAND_RANKS.STRAIGHT: return 'ストレート';
        case HAND_RANKS.THREE_OF_A_KIND: return '３カード';
        case HAND_RANKS.TWO_PAIR: return '２ペア';
        case HAND_RANKS.ONE_PAIR: return '１ペア';
        default: return 'ハイカード';
    }
}

// 勝者を決定する関数
function determineWinner() {
    const playerHands = players.map(player => ({ player, rank: determineRank(player.hand) }));
    
    // 各プレイヤーの役を表示
    players.forEach(player => {
        const rankName = getHandRankName(determineRank(player.hand));
        const resultElementId = player.isHuman ? 'player-result' : 'computer-result';
        document.getElementById(resultElementId).innerText = `${rankName}`;
    });

    const highestRank = Math.max(...playerHands.map(hand => hand.rank));

    // 最も高い役を持つプレイヤーを勝者とします
    const winners = playerHands.filter(hand => hand.rank === highestRank);

    setTimeout(() => {
        if (winners.length === 1) {
            const winner = winners[0].player;
            
            if (winner.isHuman) {
                document.getElementById('winner-result').innerHTML = 'You Win';
                coin += highestRank * betmoney; // コインを増やす
            } else {
                document.getElementById('winner-result').innerHTML = 'You Lose';
            }
            
        } else {
            document.getElementById('winner-result').innerHTML = '引き分け';
        }

        updateBetDisplay(); // 賭け金表示を更新
        document.getElementById('next-game-button').classList.remove('hidden'); // 「次のゲーム」ボタンを表示
    }, 1000);
}

// ベット操作の関数
function bet() {
    if (betmoney < 5 && coin > 0) {
        betmoney += 1; // 賭け金を増加
        coin -= 1; // コインを減らす
    }
    updateBetDisplay(); // 賭け金表示を更新
}
