require 'faye/websocket'
require 'rack'
require 'json'

Faye::WebSocket.load_adapter('thin')

clients = {}
connected_clients = 0
waiting_id = nil

run lambda { |env|
  if Faye::WebSocket.websocket?(env)
    ws = Faye::WebSocket.new(env)

    ws.on :open do |event|
      connected_clients =+ 1
      id = ws.__id__
      clients[id] = ws
      waiting_id = id unless waiting_id
      ws.send('Waiting for connection')
    end

    ws.on :message do |event|
      msg = JSON.parse(event.data)
      case msg['type']
      when 'peer'
        if waiting_id && waiting_id != ws.__id__
          peer = clients[waiting_id]
          ws.send(JSON.generate({
            type: 'peer',
            data: {
              to_peer_id: waiting_id,
              initiator: true
            }
          }))

          peer.send(JSON.generate({
            type: 'peer',
            data: {
              to_peer_id: ws.__id__
            }
          }))
          waiting_id = nil
        else
          waiting_id = ws.__id__
        end
      when 'signal'
        to_peer_id = msg['data']['to_peer_id']
        peer = clients[to_peer_id]
        peer.send(event.data)
      else
        p 'Unexpected event' 
      end
    end

    ws.on :close do |event|
      connected_clients -= 1
      clients.delete(ws.__id__)
      waiting_id = nil if ws.__id__ == waiting_id
    end

    # Return async Rack response
    ws.rack_response
  else
    if /bundle/ =~ env['PATH_INFO']
      [200, {'Content-Type' => 'text/javascript'}, File.open('public/bundle.js', File::RDONLY)]
    else
      [200, {'Content-Type' => 'text/html'}, File.open('public/index.html', File::RDONLY)]
    end
  end
}
