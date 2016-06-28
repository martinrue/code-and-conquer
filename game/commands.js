'use strict';

const statuses = require('./statuses');
const engine = require('./engine');

const verifySingleCellRequest = request => {
  if (!request.team) {
    return statuses.missingTeamKey;
  }

  const isEmpty = str => {
    return str === undefined || str === '';
  };

  if (isEmpty(request.x)) {
    return statuses.missingXCoord;
  }

  if (isEmpty(request.y)) {
    return statuses.missingYCoord;
  }
};

const verifyMultipleCellRequest = request => {
  if (!request.team) {
    return statuses.missingTeamKey;
  }

  if (!request.cells || request.cells.length > 0) {
    return statuses.missingCells;
  }

  const isEmpty = str => {
    return str === undefined || str === '';
  };

  for (let i = 0; i < request.cells.length; i++) {
    const cell = request.cells[i];

    if (isEmpty(cell.x)) {
      return statuses.missingXCoord;
    } 

    if (isEmpty(cell.y)) {
      return statuses.missingYCoord;
    }    
  }
};

const verifySpyRequest = request => {
  if (!request.team) {
    return statuses.missingTeamKey;
  }

  if (!request.target) {
    return statuses.missingTargetTeam;
  }

  const isEmpty = str => {
    return str === undefined || str === '';
  };

  if (isEmpty(request.x)) {
    return statuses.missingXCoord;
  }

  if (isEmpty(request.y)) {
    return statuses.missingYCoord;
  }
};

const attack = (team, args) => {
  const request = {
    team: team,
    x: args[0].split(',')[0],
    y: args[0].split(',')[1]
  };

  const error = verifySingleCellRequest(request);

  if (error) {
    return { status: error };
  }

  return engine.attack(request.team, request.x, request.y);
};

const defend = (team, args) => {
  const request = {
    team: team,
    x: args[0].split(',')[0],
    y: args[0].split(',')[1]
  };

  const error = verifySingleCellRequest(request);

  if (error) {
    return { status: error };
  }

  return engine.defend(request.team, request.x, request.y);
};

const query = () => {
  return engine.query();
};

const mine = (team, args) => {
  const request = {
    team: team,
    x: args[0].split(',')[0],
    y: args[0].split(',')[1]
  };

  const error = verifySingleCellRequest(request);

  if (error) {
    return { status: error };
  }

  return engine.mine(request.team, request.x, request.y);
}; 

const cloak = (team, args) => {
  const request = {
    team: team,
    cells: args.map(arg => {
      return {
        x: arg.split(',')[0],
        y: arg.split(',')[1]
      };
    })
  };

  const error = verifyMultipleCellRequest(request);

  if (error) {
    return { status: error };
  }

  return engine.cloak(request.team, request.cells);
};

const spy = (team, args) => {
  const request = {
    team: team,
    target: args[0],
    x: args[1].split(',')[0],
    y: args[1].split(',')[1]
  };

  const error = verifySpyRequest(request);

  if (error) {
    return { status: error };
  }

  return engine.spy(request.team, request.target, request.x, request.y);
};

module.exports = {
  attack,
  defend,
  query,
  mine,
  cloak,
  spy
};