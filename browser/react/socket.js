import io from 'socket.io-client';
import { change_CH_State_Everything_AC, change_Players_State_AC, set_currPlayer_socketID_AC, update_currPlayer_AC, store } from './store';
import { CONNECT } from '../js/constants';

let socket = {};//this can't be in store because ... can't serialize circular references (look into this later)

export const socketConnectCreator = (namespace = 'game') => {//didmount, dispatch this thunk   //namespace... when you are implementing the challenge part
  return function(dispatch,store){//look at namespace... (io.of(namespace).emit on the server)
    socket=io(window.location.origin);
    socket.on(CONNECT, function () {
      console.log('Connected!');
      dispatch(set_currPlayer_socketID_AC(socket.id));
    });
  }
}

export const socketEmitCreator = (eventName, payload, customLog) => {
  return function(dispatch, store){//wait are the dispatch and stores even needed????  can i just delete them
    if(customLog) console.log(customLog);
    socket.emit(eventName, payload);
  }
}

export const socketDisconnectCreator = () => {//willunmount, dispatch this thunk... also clear listeners as well
  return function(dispatch, store){
      if(socket.disconnect){//NEED THIS OR YOU WILL RUN INTO ISSUES ... not sure why but look into it
        socket.disconnect();
        socket={};
      }
  }
}

export const addSocketListenerCreator = (eventName, socketListener) => {//so you don't have to manually write all the socket.on logic in here
  return function(dispatch, store){
    socket.on(eventName, socketListener);
  }
}


//----------FIGURE THIS SHIZ OUT!!!!!!-------------

export const tempUpdStoreListener = function(chessState){//DELETE THIS WHEN YOU HAVE FIGURED OUT A LESS HACKY WAY TO DO THIS
  console.log('Server sent updated CHESS state.. about to change local store!')//REFACTOR.. TAKE THESE OUT AND JUST MAKE ANON FUNCTION
  let change_CH_State_Everything_AO = change_CH_State_Everything_AC(chessState);//UPDATE: ACTUALLY STILL CAN'T USE STORE OUTSIDE THIS CONTEXT!!!!  STILL NEED BIND STORE... //HAL SAID: STORE IS AVAILABLE, NO NEED TO BIND STORE...
  this.dispatch(change_CH_State_Everything_AO);//BIND ACTION CREATORS... LOOK IT UP
}.bind(store)//This is the only way I can get this to work... socketListener needs access to dispatch

export const tempUpdPlayersListener = function(playersState){//DELETE THIS WHEN YOU HAVE FIGURED OUT A LESS HACKY WAY TO DO THIS
  console.log('Server sent updated PLAYERS state.. about to change local store!')
  let change_Players_State_AO = change_Players_State_AC(playersState);
  this.dispatch(change_Players_State_AO);

  let storeState= this.getState();
  let storePlayersState= storeState.playersState;
  let currSocketId= storeState.currentPlayerState.socketID;
  let team;
  let name;

  for(let player of storePlayersState){
    if(player.socketID === currSocketId){
      team=player.team;
      name=player.name;
    }
  }
  let update_currPlayer_AO = update_currPlayer_AC({socketID: currSocketId,name: name, team: team})
  this.dispatch(update_currPlayer_AO);
}.bind(store)


//--------------------------------------------------

//NEED CLEAR SOCKETLISTENERS TOO!!!

// listeners..... and clearsocketlisteners
