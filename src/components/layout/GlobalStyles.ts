import { createGlobalStyle, css } from 'styled-components'

const variables = css`
  :root {
    // Colors
    --color-text-primary: #3d414c;
    --color-text-secondary: #8c8c8c;
  }
`

const GlobalStyles = createGlobalStyle`
  ${variables}

  html {
    overflow-y: scroll;
    font-size: 16px;
    box-sizing: border-box;
  }

  body {    
    min-height: 100vh;
    margin: 0;
    font-size: 16px;
    font-family: "Droid Sans", Arial, Helvetica Neue, Helvetica, sans-serif;
    line-height: 1.5;
    background-color: #f7f7f7;
    color: var(--color-text-primary);
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  a {   
    cursor: pointer;

    &, &:link, &:visited {
      color: var(--color-text-primary);
    }

    :hover {
      color: var(--color-text-secondary);
    }
  }

  h1, h2, h3 {
    margin: 0;
    margin: 0.5em 0;
  }

  h1 {
    font-size: 3rem;    
  }

  h2 {
    font-size: 2rem;
  }

  // cleaning default browser styles
  button {
    font-family: inherit;
    font-size: 100%;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  #root {
    min-height: 100vh;
  }

  button {
    padding: 0.5rem;
    margin: 0.5rem;
    border: 2px solid #8332bf;
    color: #8332bf;

    &:disabled,
    &[disabled]{
      background-color: rgba(187, 187, 187, 0.3);
      border-color: #696969 !important;
      color: #696969 !important;
      font-style: italic;
    }
    
    :hover {
      border-color: #9201fd;
      color: #9201fd;
    }

    &.success {
      border-color: #63ab52;
      color: #63ab52;

      :hover {
        border-color: #167500;
        color: #167500;
      }
    }

    &.danger {
      border-color: #ff5097;
      color: #ff5097;

      :hover {
        border-color: #ea005f;
        color: #ea005f;
      }
    }
  }

  .widget,
  .page {
    background-color: white;
    margin: -3rem auto 3rem auto;
    box-shadow: 1px 1px #e8e8e8;    
    min-height: 25rem;
  }

  .widget {
    padding: 2em;
    border-radius: 10px;
    min-width: 40vw;
  }

  .page {
    padding: 2rem 10vw 2rem 10vw;
    width: 95vw;
  }

`

export default GlobalStyles
