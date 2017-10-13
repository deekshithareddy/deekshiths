var app = new Vue({
  el: '#chatapp',
  data: {
    message: null,
    username: null,
    seen: false,
    show: true,
    socket: null,
    connected: false,
    usermessage: null,
    messagearray: [],
    activeColor: [
      '#e21400', '#91580f', '#f8a700', '#f78b00',
      '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
      '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
    ],
    userinfo: null,
    rooms: [],
    roomname: null,
    typing: false
  },
  methods: {
    setUsername() {
      // If the username is valid
      if (this.username) {
        this.show = !this.show
        this.seen = true;
        this.socket.emit('add user', this.username);
      }
    },
    sendMessage() {
      console.log("hello");
      if (this.usermessage && this.connected) {
        // tell server to execute 'new message' and send along one parameter
        this.socket.emit('new message', this.usermessage);
        this.usermessage = '';
      }
    },
    addParticipantsMessage(data) {
      this.message = '';
      if (data.numUsers === 1) {
        this.message += "there's 1 participant";
      } else {
        this.message += "there are " + data.numUsers + " participants";
      }
    },
    addChatMessage(data) {
      console.log(JSON.stringify(data));
      this.messagearray.push({
        type: 'usermessage',
        'sendusername': data.username,
        'sendmessage': data.message
      })
      console.log(JSON.stringify(this.messagearray));
    },
    addroom() {
      if (this.roomname && this.connected) {
        this.socket.emit('newroomname', this.roomname);
        this.roomname = '';
      }
    },
    switchroom: function (data) {
      console.log(data);
      this.socket.emit('switchRoom', data);
      this.messagearray = [];
      this.message = '';
    },
    getUsernameColor(username) {
      // Compute hash code
      var hash = 7;
      for (var i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + (hash << 5) - hash;
      }
      // Calculate color
      var index = Math.abs(hash % this.activeColor.length);
      return this.activeColor[index];
    }
  },

  mounted() {
    let scope = this
    this.socket = io();
    this.socket.on('user joined', function (data) {
      scope.addParticipantsMessage(data);
    });
    this.socket.on('login', function (data) {
      scope.connected = true;
      // Display the welcome message
      scope.message = "Welcome to Socket.IO Chat – ";
      scope.addParticipantsMessage(data);
    });
    this.socket.on('new message', function (data) {
      scope.addChatMessage(data);
    });
    this.socket.on('viewroom', function (rooms) {
      scope.rooms.splice(0, rooms.length, ...rooms);
    });
    this.socket.on('user left', function (data) {
      console.log(JSON.stringify(data));
      let value = data.username + '  user left'
      scope.messagearray.push({ type: 'logedmessage', 'logmessage': value });
      scope.addParticipantsMessage(data);
    });
    this.socket.on('user joined', function (data) {
      let value = data.username + '   user joined'
      scope.messagearray.push({ type: 'logedmessage', 'logmessage': value });
      scope.addParticipantsMessage(data);
    });

  }
})