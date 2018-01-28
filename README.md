# tennu-meme-generator

A plugin for the [tennu](https://github.com/Tennu/tennu) irc framework.

Generate memes. Email me for an API key as I dont have infrastructure setup to generate and issue keys yet.

### Commands

- **meme**: Raw command. Uses yargs and sends all args as JSON to the API.
- **memes**: Friendly command. `!memes <url> [<top text>][/<bottom text>]`

### Configuration

`{ "meme": { .... `
- api-url: already has a default value
- api-key: (can use env MEME_API_KEY instead)

### Installing Into Tennu

See Downloadable Plugins [here](https://tennu.github.io/plugins/).


### TODO

- Might be cool to have a lookup table with common memes.