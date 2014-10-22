/** @jsx React.DOM */
// spreadsheet.js
var rows = [[1,2,3,4], [6,7,8,9], [10,11,12,24]].map(function(row, i) {
  return row.map(function(cell, j) {
    return {
      'focus': cell == 1 ? true : false,
      'value': cell,
      'row': i,
      'column': j,
      'editing': false
    };
  });
});

var Spreadsheet = React.createClass({

  getInitialState: function() {
    return {
      rows: rows
    };
  },

  numberOfRows: function() {
    return this.state.rows.length;
  },

  numberOfColumns: function() {
    return this.state.rows[0].length;
  },

  handleLeftKey: function() {
    var currentCell = this.currentFocus();
    if(currentCell.column > 0) {
      this.focusCell(currentCell.row, currentCell.column - 1);
    }
  },

  handleRightKey: function() {
    var currentCell = this.currentFocus();
    if(currentCell.column < this.numberOfColumns() - 1) {
      this.focusCell(currentCell.row, currentCell.column + 1);
    }
  },

  handleUpKey: function() {
    var currentCell = this.currentFocus();
    if(currentCell.row > 0) {
      this.focusCell(currentCell.row - 1, currentCell.column);
    }
  },

  handleDownKey: function() {
    var currentCell = this.currentFocus();
    if(currentCell.row < this.numberOfRows() - 1) {
      this.focusCell(currentCell.row + 1, currentCell.column);
    }
  },

  handleEnter: function() {
    var currentCell = this.currentFocus();
    if(!currentCell.editing) {
      console.log('entering edit mode');
      this.modifyCell(currentCell.row, currentCell.column, function(cell) {
        cell['editing'] = true;
        return cell;
      });
    }
  },

  handleKeyDown: function(e) {
    var dispatcher = {
      13: 'handleEnter',
      37: 'handleLeftKey',
      38: 'handleUpKey',
      39: 'handleRightKey',
      40: 'handleDownKey'
    };
    var keyCode = e.keyCode;
    if(keyCode in dispatcher) {
      var f = dispatcher[keyCode];
      this[f]();
    }
  },

  currentFocus: function() {
    for(var i in this.state.rows) {
      var row = this.state.rows[i];
      for(var j in row) {
        var cell = row[j];
        if(cell.focus) {
          return cell;
        }
      }
    }
    return nil;
  },

  modifyCell: function(row, column, f) {
    var rows = this.state.rows;
    var cell = rows[row][column];
    rows[row][column] = f(cell);
    console.log(rows[row][column]);
    this.setState({rows: rows});
  },

  focusCell: function(row, column) {
    var currentCell = this.currentFocus();
    this.unFocusCell(currentCell.row, currentCell.column);
    this.modifyCell(row, column, function(cell) {
      cell['focus'] = true;
      return cell;
    });
  },

  unFocusCell: function(row, column) {
    this.modifyCell(row, column, function(cell) {
      cell['focus'] = false;
      return cell;
    });
  },

  render: function() {
    var rows = this.state.rows.map(function(row) {
      return (
        <Row row={row} focusCell={this.focusCell} modifyCell={this.modifyCell} />
      );
    }.bind(this));
    return (
      <table className="spreadsheet" onKeyDown={this.handleKeyDown} tabIndex="1">
        {rows}
      </table>
    );
  }
});

var Row = React.createClass({
  render: function() {
    var cells = this.props.row.map(function(cell) {
      return (
        <Cell cell={cell} focusCell={this.props.focusCell} modifyCell={this.props.modifyCell}  />
      );
    }.bind(this));
    return (
      <tr>
        {cells}
      </tr>
    );
  }
});

var Cell = React.createClass({
  handleOnClick: function() {
    this.props.focusCell(this.props.cell.row, this.props.cell.column);
  },

  modifyCell: function(f) {
    this.props.modifyCell(this.props.cell.row, this.props.cell.column, f);
  },

  handleOnKeyDown: function(e) {
    console.log('got key down ', e.keyCode);
    if(e.keyCode == 13) {
      console.log('saving cell');
      this.modifyCell(function(cell) {
        cell['value'] = this.refs.cellValue.getDOMNode().value;
        cell['editing'] = false;
        return cell;
      }.bind(this));
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    if(this.props.cell.editing) {
      console.log('focussing');
      this.refs.cellValue.getDOMNode().focus();
    }
  },

  render: function() {
    var focus = this.props.cell.focus ? 'focus' : '';
    if(!this.props.cell.editing) {
      return (
        <td className={focus} onClick={this.handleOnClick}>
          {this.props.cell.value}
        </td>
      );
    } else {
      return (
        <td className={focus} onClick={this.handleOnClick} ref="editingCell">
          <input type="text" onKeyDown={this.handleOnKeyDown} ref="cellValue"/>
        </td>
      );
    }
  }
});

React.renderComponent(
  <Spreadsheet />,
  document.getElementById('content')
);
