import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.makeCleanBoard = this.makeCleanBoard.bind(this);
    this.handleBoxClick = this.handleBoxClick.bind(this);
    this.identifyClueStarts = this.identifyClueStarts.bind(this);
    var rows = 10;
    this.state = {
      rows: rows,
      acrossClues: {},
      downClues: {},
      board: this.makeCleanBoard(rows),
      hoveredClue: null
    };
  }
  componentDidMount() {
    this.identifyClueStarts();
  }

  handleBoxClick(x, y) {
    var currentBoard = this.state.board;
    if(currentBoard[y][x].value === null) {
      currentBoard[y][x].value = ""
    } else {
      currentBoard[y][x].value = null;
    }
    this.setState({board: currentBoard}, this.identifyClueStarts);
  }

  handleClueClick(type, number) {
    console.log(type + " : " + number);
    var clue = prompt("Please enter a clue");
    var answer = prompt("Please enter an answer");
    console.log(clue + ": " + answer);
  }

  handleClueMouseover(type, number) {
    this.setState({hoveredClue: number + "" + type});
  }

  handleClueMouseLeave() {
    this.setState({hoveredClue: null});
  }

  makeCleanBoard(boxSize) {
    var board = [];
    for(var i = 0; i < boxSize; i++) {
      var row = [];
      for(var j = 0; j < boxSize; j++) {
        row.push({ clueNum: null, value: "", partOf: []});
      }
      board.push(row);
    }
    return board;
  }

  identifyClueStarts() {
    var board = this.state.board;
    var clueCurrentTotal = 1; // start at 1 :(
    var acrossClues = [];
    var downClues = [];
    for(var i = 0; i < board.length; i++) {
      for(var j = 0; j < board[i].length; j++) {
        board[i][j].partOf = [];
        // skip blank spots
        if(board[i][j].value === null){
          continue;
        }

        var isClueStart = false;
        if(i === 0 || (board[i - 1] && board[i - 1][j].value === null)) {
          board[i][j].partOf.push(clueCurrentTotal + "D")
          downClues.push(clueCurrentTotal);
          isClueStart = true;
        } else if(board[i - 1] && board[i - 1][j].value !== null && board[i - 1][j].partOf.length > 0) {
          for(var k = 0; k < board[i - 1][j].partOf.length; k++) {
            if(board[i - 1][j].partOf[k].indexOf("D") > -1) {
              board[i][j].partOf.push(board[i - 1][j].partOf[k]);
            }
          }
        }
        if(j === 0 || (board[i][j - 1] && board[i][j - 1].value === null)) {
          board[i][j].partOf.push(clueCurrentTotal + "A")
          acrossClues.push(clueCurrentTotal)
          isClueStart = true;
        } else if(board[i][j - 1] && board[i][j - 1].value !== null && board[i][j - 1].partOf.length > 0) {
          for(var k = 0; k < board[i][j - 1].partOf.length; k++) {
            if(board[i][j - 1].partOf[k].indexOf("A") > -1) {
              board[i][j].partOf.push(board[i][j - 1].partOf[k]);
            }
          }
        }

        if(isClueStart) {
          board[i][j].clueNum = clueCurrentTotal;
          clueCurrentTotal += 1;
        }
      }
    }
    var acrossCluesHash = {};
    var downCluesHash = {};
    acrossClues.forEach(function(item){
      acrossCluesHash[item] = { clue: "", answer: "" }
    });
    downClues.forEach(function(item){
      downCluesHash[item] = { clue: "", answer: "" }
    });
    this.setState({board: board, acrossClues: acrossCluesHash, downClues: downCluesHash});
  }

  render() {
    var rows = [];

    for(var j = 0; j < this.state.board.length; j++) {
      var boxes = [];
      for(var i = 0; i < this.state.board[j].length; i++) {
        var boxClasses = "board-square";
        var letterText;
        if(this.state.board[j][i].value === null) {
          boxClasses += " unavailable";
        } else if(this.state.board[j][i].value !== "") {
          letterText = <p>{this.state.board[j][i].value}</p>;
        }
        if(this.state.board[j][i].partOf.indexOf(this.state.hoveredClue) > -1) {
          boxClasses += " hovered";
        }
        if(this.state.board[j][i].clueNum){
          boxes.push(
            <div className={boxClasses} key={i + ":" + j} onClick={this.handleBoxClick.bind(this, i, j)}>
              <p className="numbers">{this.state.board[j][i].clueNum}</p>
              {letterText}
            </div>
          );
        } else {
          boxes.push(
            <div className={boxClasses} key={i + ":" + j} onClick={this.handleBoxClick.bind(this, i, j)}>{letterText}</div>
          );
        }
      }
      rows.push(
        <div className="board-row" key={"row:" + j}>{boxes}</div>
      );
    }

    var acrossCluesDivs = Object.keys(this.state.acrossClues).map(function(item) {
      var text = item + ". " + this.state.acrossClues[item].clue;
      return (
        <div className="clue" onClick={this.handleClueClick.bind(this, "A", item)} 
            onMouseEnter={this.handleClueMouseover.bind(this, "A", item)} onMouseLeave={this.handleClueMouseLeave.bind(this)}>
          {text}
        </div>
      );
    }.bind(this));
    var downCluesDivs = Object.keys(this.state.downClues).map(function(item) {
      var text = item + ". " + this.state.downClues[item].clue;
      return (
        <div className="clue" onClick={this.handleClueClick.bind(this, "D", item)} 
            onMouseEnter={this.handleClueMouseover.bind(this, "D", item)} onMouseLeave={this.handleClueMouseLeave.bind(this)}>
          {text}
        </div>
      );
    }.bind(this));
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Crossword Generator</h1>
        </header>
        <div className="board">
          {rows}
        </div>
        <div className="clues-container">
          <div className="ind-clue-container across">
            <h2>Across</h2>
            {acrossCluesDivs}
          </div>
          <div className="ind-clue-container down">
            <h2>Down</h2>
            {downCluesDivs}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
