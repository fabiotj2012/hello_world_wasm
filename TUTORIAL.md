# Tutorial: "Hello, World!" com Rust e WebAssembly (WASM)

Este tutorial demonstra como criar um projeto Rust que compila tanto para um executável nativo (EXE) quanto para WebAssembly, permitindo que o mesmo código seja executado no desktop e no navegador.

## Pré-requisitos

- **Rust:** Instale via [rustup](https://rustup.rs/).
- **wasm-pack:** Instale com `cargo install wasm-pack`.

## Passo 1: Crie o Projeto

Crie uma nova biblioteca Rust. O nome `hello_world_wasm` foi usado neste exemplo.

```bash
cargo new --lib hello_world_wasm
cd hello_world_wasm
```

## Passo 2: Configure o `Cargo.toml`

Substitua o conteúdo do seu `Cargo.toml` para suportar ambas as compilações (nativa e web):

```toml
[package]
name = "hello_world_wasm"
version = "0.1.0"
edition = "2024"

# Define os tipos de crate para biblioteca dinâmica e estática
[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
# Dependência específica para o alvo WASM
[target.'cfg(target_arch = "wasm32")'.dependencies]
wasm-bindgen = "0.2"

# Define o executável para a compilação nativa
[[bin]]
name = "hello_world_native"
path = "src/main.rs"
```

## Passo 3: Escreva o Código Rust

Vamos criar a lógica compartilhada (`lib.rs`) e o ponto de entrada para o executável nativo (`main.rs`).

**1. Lógica Compartilhada (`src/lib.rs`):**

Este arquivo contém a função `greet()` que será usada por ambos os alvos.

```rust
// Atributos para compilação condicional (apenas para WASM)
#[cfg(target_arch = "wasm32")]
use wasm_bindgen::prelude::*;

// Expõe a função `greet` para o JavaScript quando compilado para WASM
#[cfg_attr(target_arch = "wasm32", wasm_bindgen)]
pub fn greet() -> String {
    "Hello, world!".to_string()
}
```

**2. Executável Nativo (`src/main.rs`):**

Crie este novo arquivo. Ele simplesmente chama a função `greet()` da nossa biblioteca.

```rust
// Importa a função do nosso crate (biblioteca)
use hello_world_wasm::greet;

fn main() {
    println!("{}", greet());
}
```

## Passo 4: Crie a Interface Web

**1. Página HTML (`src/index.html`):**

Crie o arquivo que servirá como a página da sua aplicação web.

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Hello, Rust + WASM!</title>
  </head>
  <body>
    <!-- O `type="module"` é crucial para usar `import` no JavaScript -->
    <script type="module" src="./bootstrap.js"></script>
  </body>
</html>
```

**2. Módulo JavaScript (`src/bootstrap.js`):**

Crie o arquivo que irá carregar e executar o seu código WASM.

```javascript
// Importa a função de inicialização e a função `greet` do pacote WASM
// O caminho `../pkg/` aponta para a pasta gerada pelo wasm-pack
import init, { greet } from "../pkg/hello_world_wasm.js";

// Inicializa o módulo WASM e, em caso de sucesso, chama a função `greet`
init()
  .then(() => {
    alert(greet());
  })
  .catch(console.error);
```

## Passo 5: Compile

**1. Compilar para WebAssembly:**

Este comando compila seu código Rust para WASM e o prepara em um pacote dentro do diretório `pkg/`.

```bash
wasm-pack build --target web
```

**2. Compilar para Executável Nativo:**

```bash
cargo build
```

## Passo 6: Execute a Aplicação

**Executável Nativo:**

```bash
cargo run
# Saída esperada: Hello, world!
```

**Aplicação Web:**

Para visualizar no navegador, você precisa de um servidor local.
1.  Navegue até o diretório `hello_world_wasm`.
2.  Inicie um servidor a partir da raiz do projeto. Se você tem o VS Code, a extensão "Live Server" funciona bem (clique com o botão direito no arquivo `src/index.html` e selecione "Open with Live Server").
3.  Abra o `index.html` através do servidor local. Um alerta com "Hello, world!" deve aparecer.

## Estrutura de Arquivos

### Pasta `src` - Código Fonte

-   `lib.rs`: O coração da sua biblioteca Rust. Contém a lógica principal (`fn greet()`) que é compartilhada entre o executável nativo e o WebAssembly. A compilação condicional (`#[cfg(...)]`) garante que o código específico do `wasm-bindgen` seja usado apenas no alvo web.
-   `main.rs`: O ponto de entrada para a compilação nativa (EXE). Ele atua como um programa Rust padrão que importa e utiliza a funcionalidade da sua biblioteca (`lib.rs`).
-   `index.html`: A página web que o usuário final abrirá no navegador. Sua única função é carregar o script JavaScript que inicializa o WASM.
-   `bootstrap.js`: O "lançador" do seu WebAssembly. Ele importa o módulo WASM, o inicializa e chama as funções exportadas do Rust (como a `greet()`).

### Pasta `pkg` - Pacote WebAssembly

Esta pasta é **gerada automaticamente** pelo `wasm-pack`. Ela contém tudo o que é necessário para usar seu código Rust no navegador.

-   `hello_world_wasm_bg.wasm`: O seu código Rust compilado para o formato binário WebAssembly. Este é o arquivo que o navegador realmente executa.
-   `hello_world_wasm.js`: O "cola" JavaScript gerado pelo `wasm-bindgen`. Ele cria uma ponte entre o JavaScript e o seu código WASM, permitindo que você chame funções Rust (como `greet()`) diretamente do seu código JS. Ele também gerencia a memória e outras interações complexas.
-   `hello_world_wasm.d.ts`: Arquivo de definição de tipos para TypeScript. Fornece autocompletar e verificação de tipos se você estiver usando TypeScript no seu projeto web.
-   `package.json`: Um arquivo de manifesto que descreve este pacote, listando os arquivos que o compõem. É útil para a integração com ecossistemas JavaScript modernos.