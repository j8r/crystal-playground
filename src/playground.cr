# Command line part for Playground
require "compiler/crystal/**"
require "./playground/*"

server = Playground::Server.new

OptionParser.parse(ARGV) do |opts|
  opts.banner = "Usage: crystal play [options] [file]\n\nOptions:"

  opts.on("-p PORT", "--port PORT", "Runs the playground on the specified port") do |port|
    server.port = port.to_i
  end

  opts.on("-b HOST", "--binding HOST", "Binds the playground to the specified IP") do |host|
    server.host = host
  end

  opts.on("-v", "--verbose", "Display detailed information of executed code") do
    server.logger.level = Logger::Severity::DEBUG
  end

  opts.on("-h", "--help", "Show this message") do
    puts opts
    exit
  end

  opts.unknown_args do |before, after|
    if before.size > 0
      server.source = gather_sources([before.first]).first
    end
  end
end

private def gather_sources(filenames)
  filenames.map do |filename|
    unless File.file?(filename)
      # This is for the case where the main command is wrong
      color = ARGV.includes?("--no-color") ? false : true
      # Crystal.error msg, color, exit_code: exit_code
      Crystal.error "File #{filename} does not exist", color, 1
    end
    filename = File.expand_path(filename)
    Crystal::Compiler::Source.new(filename, File.read(filename))
  end
end

server.start
