<script>
  import Peer from 'peerjs';
        import { onMount } from 'svelte';
  let peer;
  let connection;
  let remoteId = '';
  let message = '';
  let chatLog = [];

  // Initialize PeerJS
  onMount(() => {
    peer = new Peer(); // Automatically generates an ID
    peer.on('open', (id) => {
      console.log('Your ID:', id);
    });

    // Listen for incoming connections
    peer.on('connection', (conn) => {
      connection = conn;
      setupConnectionEvents(connection);
    });
  });

  const connectToPeer = () => {
    connection = peer.connect(remoteId);
    setupConnectionEvents(connection);
  };

  const setupConnectionEvents = (conn) => {
    conn.on('data', (data) => {
      chatLog = [...chatLog, `Peer: ${data}`];
    });
  };

  const sendMessage = () => {
    if (connection) {
      connection.send(message);
      chatLog = [...chatLog, `You: ${message}`];
      message = '';
    }
  };
</script>

<div>
  <h2>PeerJS Chat</h2>
  <div>
    <h3>Your Peer ID</h3>
    <code>{peer?.id || 'Generating...'}</code>
  </div>
  <div>
    <h3>Connect to Peer</h3>
    <input bind:value={remoteId} placeholder="Remote Peer ID" />
    <button on:click={connectToPeer}>Connect</button>
  </div>
  <div>
    <h3>Chat</h3>
    <textarea rows="10" cols="50" readonly value={chatLog.join('\n')}></textarea>
    <input bind:value={message} placeholder="Type a message" />
    <button on:click={sendMessage}>Send</button>
  </div>
</div>

