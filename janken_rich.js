// ゲームの状態を管理するオブジェクト
let gameState = {
    stage: 1,  // ステージ番号
    playerWins: 0,  // プレイヤーの勝利数
    playerLosses: 0,  // プレイヤーの負け数
    gameOver: false,  // ゲームオーバー状態
    shuffleInterval: null,  // シャッフルのインターバル
    computerChoice: "", // コンピュータの選択肢を保存する変数
    isFirstGame: true //最初の勝負かどうかを判定するフラグ
};

// コンピュータの選択肢
const choices = ["グー", "チョキ", "パー"];

//音声ファイル
const jankenSound = new Audio("audio/janken-janken.mp3"); //じゃんけん音声
const ponSound = new Audio("audio/janken-pon.mp3"); //ぽん音声
const winSound = new Audio("audio/janken-yappii.mp3"); //勝利音声
const loseSound = new Audio("audio/janken-zukoo.mp3"); //負け音声
const drawSound = new Audio("audio/janken-aikode.mp3"); //あいこ音声
const draw_shoSound = new Audio("audio/janken-sho.mp3"); //しょ！音声

// スタートボタンをクリックした時にコンピュータの手をシャッフルする
document.getElementById("start-button").addEventListener("click", function () {
    startGame(); // ゲームを開始
    document.getElementById("start-button").style.display = "none"; // スタートボタンを非表示にする
});

// ゲーム開始時にシャッフルを始める
function startGame() {
    // シャッフル開始
    gameState.shuffleInterval = setInterval(shuffleComputerChoice, 90);
    jankenSound.play(); //「じゃんけん〜」
}

// コンピューターの手をシャッフル
function shuffleComputerChoice() {
    const randomChoice = choices[Math.floor(Math.random() * choices.length)];
    const computerChoiceImg = document.getElementById("computer-choice");

    if (randomChoice === "グー") {
        computerChoiceImg.innerHTML = '<img src="img/img_rock1.png" alt="コンピューター: グー" class="choice-button" />';
    } else if (randomChoice === "チョキ") {
        computerChoiceImg.innerHTML = '<img src="img/img_scissors1.png" alt="コンピューター: チョキ" class="choice-button" />';
    } else if (randomChoice === "パー") {
        computerChoiceImg.innerHTML = '<img src="img/img_paper1.png" alt="コンピューター: パー" class="choice-button" />';
    }
}

// プレイヤーが選択した場合、シャッフルを止めて最終的なコンピュータの手を決定
function playerChoice(choice) {
    if (gameState.gameOver) return;  // ゲームオーバーなら選択を無効化

    // シャッフルを止める
    clearInterval(gameState.shuffleInterval);

    // コンピュータの最終的な手を決定
    const computerChoice = getComputerChoice();
    gameState.computerChoice = computerChoice;  // コンピュータの選択を保存

    // 結果を表示
    const result = determineWinner(choice, computerChoice);

    //最初の勝負（isFirstGameがtrue）の場合には必ず「ぽん」音声
    if (gameState.isFirstGame) {
        ponSound.play(); //最初は必ず「ぽん」音声
        gameState.isFirstGame = false; //1回目の勝負が終わったのでフラグをリセット
    } else {
        if (result === "あいこ") {
            draw_shoSound.play();
        } else {
            draw_shoSound.play(); //2回目以降はあいこでしかないので「しょ」音声
        }
    }

    showResult(choice, computerChoice, result);

    //結果表示後、強調表示をリセットして次の勝負へ進む処理
    setTimeout(function () {

        //勝敗に応じて「次のステージに進む」ボタンや「もう1回勝負！」ボタンを表示
        if (gameState.playerWins >= 3) {
            document.getElementById("next-stage").style.display = "block";
            document.getElementById("play-again").style.display = "none";
        } else {
            document.getElementById("play-again").style.display = "block";
            document.getElementById("next-stage").style.display = "none";
        }
    });
}

// コンピューターの選択をランダムで決定（ステージに応じて強さを調整）
function getComputerChoice() {
    const bias = gameState.stage;  // ステージが進むごとにバイアスが大きくなる
    if (bias === 1) {
        return choices[Math.floor(Math.random() * choices.length)];  // ランダム
    } else {
        // ステージが進むごとに、選択肢が偏りやすくなる
        const biasedChoices = choices.slice(0, bias);  // バイアスに応じて選択肢を絞る
        return biasedChoices[Math.floor(Math.random() * biasedChoices.length)];
    }
}

// 勝敗を判定する
function determineWinner(playerChoice, computerChoice) {
    let result;

    if (playerChoice === computerChoice) {
        result = "あいこ";
    } else if (
        (playerChoice === "グー" && computerChoice === "チョキ") ||
        (playerChoice === "チョキ" && computerChoice === "パー") ||
        (playerChoice === "パー" && computerChoice === "グー")
    ) {
        result = "あなたの勝ち！！";
        gameState.playerWins++; //プレイヤーの勝利数を増加
        document.getElementById("win-count").textContent = gameState.playerWins //勝利数を更新
    } else {
        result = "コンピューターの勝ち";
        //ここで負け数を1回だけ増加させる
        if (gameState.playerLosses === undefined) {
            gameState.playerLosses = 0; //初期化
        }
        gameState.playerLosses++; //プレイヤーの負け数を増加
        document.getElementById("loss-count").textContent = gameState.playerLosses; //負け数を更新
    }

    //勝敗に応じてテキストを光らせる
    updateJudgeText(result);

    //結果に応じた音声を0.5秒後に再生
    setTimeout(function () {
        if (result === "あなたの勝ち！！") {
            winSound.play(); //勝利音声再生
        } else if (result === "コンピューターの勝ち") {
            loseSound.play(); //負け音声再生
        } else if (result === "あいこ") {
            drawSound.play(); //あいこ音声再生
        }
    }, 500); //0.5秒後に再生
    return result;
}

//updateJudgeText関数の作成
function updateJudgeText(result) {
    // 全てのテキストからactiveクラスを削除
    document.getElementById("win").classList.remove("active");
    document.getElementById("draw").classList.remove("active");
    document.getElementById("lose").classList.remove("active");

    // 結果に応じて対応するテキストにactiveクラスを追加
    if (result === "あなたの勝ち！！") {
        document.getElementById("win").classList.add("active");
    } else if (result === "コンピューターの勝ち") {
        document.getElementById("lose").classList.add("active");
    } else if (result === "あいこ") {
        document.getElementById("draw").classList.add("active");
    }
}

// 結果を表示する
function showResult(playerChoice, computerChoice, result) {
    // 結果テキストを表示
    const resultText = `<br> 結果: ${result}`;
    //document.getElementById("result").innerHTML = resultText;

    // コンピュータの選択に応じた画像を表示
    const computerChoiceImg = document.getElementById("computer-choice");
    if (computerChoice === "グー") {
        computerChoiceImg.innerHTML = '<img src="img/img_rock1.png" alt="コンピューター: グー" class="choice-button" />';
    } else if (computerChoice === "チョキ") {
        computerChoiceImg.innerHTML = '<img src="img/img_scissors1.png" alt="コンピューター: チョキ" class="choice-button" />';
    } else if (computerChoice === "パー") {
        computerChoiceImg.innerHTML = '<img src="img/img_paper1.png" alt="コンピューター: パー" class="choice-button" />';
    }

    // プレイヤーの選択を強調表示
    // 以前の選択状態をリセット
    document.querySelectorAll(".choice-button").forEach(button => {
        button.classList.remove("selected");
    });

    // プレイヤーの選択に応じて強調表示
    if (playerChoice === "グー") {
        document.getElementById("rock").classList.add("selected");
    } else if (playerChoice === "チョキ") {
        document.getElementById("scissors").classList.add("selected");
    } else if (playerChoice === "パー") {
        document.getElementById("paper").classList.add("selected");
    }

    //あいこだった場合、「もう1回勝負！」ボタンを表示しない
    if (result === "あいこ") {
        document.getElementById("play-again").style.display = "none";

        //0.5秒後にシャッフルを再開する
        setTimeout(function () {
            gameState.shuffleInterval = setInterval(shuffleComputerChoice, 200); //シャッフル再開
            //強調表示をリセット
            document.querySelectorAll(".choice-button").forEach(button => {
                button.classList.remove("selected"); //強調表示を消す
            });
        }, 500); //0.5秒後にシャッフル再開

        //あいこの場合の音声を再生
        draw_shoSound.play(); //どの手を選択しても「しょ！」音声が再生
    } else {
        //勝敗がついた場合、「もう1回勝負！」ボタンを表示
        document.getElementById("play-again").style.display = "block";
    }

    // プレイヤーが3回勝ったら「次のステージへ進む」ボタンを表示
    if (gameState.playerWins >= 3) {
        document.getElementById("next-stage").style.display = "block";  // ボタンを表示
    }

    // ゲームオーバーの条件: ステージ5に到達 or 負けが3回
    if (gameState.stage >= 5 || gameState.playerLosses >= 3) {
        gameState.gameOver = true;
        let gameOverMessage = "";
        if (gameState.stage >= 5) {
            gameOverMessage = "<br>Clear！！ステージ5に到達しました！！すごい！！！";
        } else if (gameState.playerLosses >= 3) {
            gameOverMessage = "<br>Game Over…このステージで3回負けました";
        }
        document.getElementById("result").innerHTML += gameOverMessage;

        // ボタンの表示・非表示を調整
        document.getElementById("play-again").style.display = "none";  // 次のステージへ進むボタン非表示
        document.getElementById("restart").style.display = "block";  // リスタートボタン表示
    }
}

//「もう1回勝負する！」ボタンが押された時の処理
document.getElementById("play-again").addEventListener("click", function () {
    if (gameState.gameOver) return; //ゲームオーバーなら処理しない
    
    //「最初の勝負」フラグをリセット
    gameState.isFirstGame = true; //再戦時はフラグをtrueにリセット
    
    //結果表示をクリア
    document.getElementById("result").innerHTML = "";

    //「もう1回勝負する！」ボタンを非表示にする
    document.getElementById("play-again").style.display = "none";

    //コンピューターの手をシャッフルを再開
    gameState.shuffleInterval = setInterval(shuffleComputerChoice, 200);

    //シャッフル開始時に「じゃんけん〜」を再生
    jankenSound.play();

    //プレイヤーが選択を行えるようにボタンの選択状態をリセット
    document.querySelectorAll(".choice-button").forEach(button => {
        button.classList.remove("selected")
    });
});

// プレイヤーの選択を処理する関数
document.getElementById("rock").addEventListener("click", function() {
    playerChoice("グー");
});

document.getElementById("scissors").addEventListener("click", function() {
    playerChoice("チョキ");
});

document.getElementById("paper").addEventListener("click", function() {
    playerChoice("パー");
});

// "次のステージへ進む" ボタンが押された時の処理
document.getElementById("next-stage").addEventListener("click", function() {
    if (gameState.gameOver) return;  // ゲームオーバーなら処理しない

    gameState.playerWins = 0;  // 勝利数をリセット
    gameState.playerLosses = 0;  // 負け数をリセット
    document.getElementById("win-count").textContent = gameState.playerWins;  // 勝利数の表示をリセット
    document.getElementById("loss-count").textContent = gameState.playerLosses;  // 負け数の表示をリセット
    gameState.stage++;  // ステージを進める
    document.getElementById("stage-number").textContent = gameState.stage;  // ステージ番号を更新

    // 次のステージへ進む前にボタン非表示
    document.getElementById("next-stage").style.display = "none";  
    document.getElementById("result").innerHTML = '';  // 結果の表示をクリア
    document.getElementById("start-button").style.display = "block"; //スタートボタンの再表示

    //選択状態をリセット
    document.querySelectorAll(".choice-button").forEach(button => {
        button.classList.remove("selected");
    });
});

// "最初からやり直す" ボタンが押された時の処理
document.getElementById("restart").addEventListener("click", function() {
    // ゲーム状態を初期化
    gameState.stage = 1;
    gameState.playerWins = 0;
    gameState.playerLosses = 0;
    gameState.gameOver = false;

    // 表示を初期化
    document.getElementById("win-count").textContent = gameState.playerWins;
    document.getElementById("loss-count").textContent = gameState.playerLosses;
    document.getElementById("stage-number").textContent = gameState.stage;
    document.getElementById("result").innerHTML = '';

    // ボタンを非表示にして、最初の状態に戻す
    document.getElementById("play-again").style.display = "none";
    document.getElementById("restart").style.display = "none";
    document.getElementById("start-button").style.display = "block"; //スタートボタンの再表示

    //選択状態をリセット
    document.querySelectorAll(".choice-button").forEach(button => {
        button.classList.remove("selected");
    });
});
