require "http"
require "json"

class Crystal::Playground::Agent
  def initialize(url, @session, @tag)
    @ws = HTTP::WebSocket.new(URI.parse(url))
  end

  def i # para la lineas en blanco
  end

  def i(value, line, names = nil)
    send "value" do |json, io|
      json.field "line", line
      json.field "value", to_value(value)

      if names && value.is_a?(Tuple)
        json.field "data" do
          io.json_object do |json|
            value.to_a.zip(names) do |v, name|
              json.field name, v.inspect
            end
          end
        end
      end
    end

    value
  end

  def to_value(value : Void)
    "(void)"
  end

  def to_value(value : Void?)
    if value
      "(void)"
    else
      nil.inspect
    end
  end

  def to_value(value)
    value.inspect
  end

  def exit(status)
    send "exit" do |json|
      json.field "status", status
    end
  end

  private def send(message_type)
    message = String.build do |io|
      io.json_object do |json|
        json.field "session", @session
        json.field "tag", @tag
        json.field "type", message_type

        yield json, io
      end
    end

    @ws.send(message) rescue nil
  end
end
