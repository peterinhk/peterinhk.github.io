# Conway's Game of Life (Rust + WebAssembly)

The Rust simulation logic (`Universe`/`Cell`) is compiled from the official
[rustwasm/wasm_game_of_life](https://github.com/rustwasm/wasm_game_of_life)
tutorial to a `pkg/` WebAssembly module via `wasm-pack build --target web`.
`index.html` and `main.js` are a lightweight, mobile-friendly page written
against that module directly (no bundler required — modern browsers load
`pkg/wasm_game_of_life.js` as a native ES module).

Licensed MIT OR Apache-2.0, same as the upstream tutorial (see
`LICENSE_MIT` / `LICENSE_APACHE`).
