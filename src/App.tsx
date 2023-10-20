// let users apply filters and so on in a layered (?) way
// so basically steps through different transformations and applies all the effects sequentially
// i think just load ffmpeg when they click on upload video

import Editor from "./components/Editor";
import styled from "styled-components";

const Layout = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const StyledButton = styled.button`
  cursor: pointer;
  border: 1px solid white;
  border-radius: 12px;
  padding: 1rem;
  
  &:hover {
    background: #333333;
  }
`;

const App = () => {
    return (
      <Layout>
          <Editor />
      </Layout>
  );
}

export default App;