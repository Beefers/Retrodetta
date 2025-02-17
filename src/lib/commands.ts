import { ApplicationCommand } from "@types";
import { commands as commandsModule } from "@metro/common";
import { after } from "@lib/patcher";

let commands: ApplicationCommand[] = [];

export function patchCommands() {
    const unpatch = after("getBuiltInCommands", commandsModule, (_, res) => res.concat(commands));
    return () => {
        commands = [];
        unpatch();
    }
}

export function registerCommand(command: ApplicationCommand): () => void {
	// Get built in commands
	const builtInCommands = commandsModule.getBuiltInCommands(1, true, false);
	builtInCommands.sort(function (a: ApplicationCommand, b: ApplicationCommand) { return parseInt(b.id!) - parseInt(a.id!) });

	const lastCommand = builtInCommands[builtInCommands.length - 1];

	// Override the new command's id to the last command id - 1
	command.id = (parseInt(lastCommand.id, 10) - 1).toString();

	// Add it to the commands array
	commands.push(command);

	// Return command id so it can be unregistered
	return () => commands = commands.filter(({ id }) => id !== command.id);
}