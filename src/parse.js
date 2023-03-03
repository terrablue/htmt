import {default as tokenize, START_TAG, END_TAG, CHARACTER}
  from "./tokenize.js";

export const TAG = 0;
export const TEXT = 1;
export const PSEUDO = 2;

export const makeTag = tagName => ({type: TAG, tagName, children: []});
const makePseudo = () => ({type: PSEUDO, children: []});
export const makeText = data => ({type: TEXT, data});

const parse = tokens => {
  const root = makePseudo();
  const stack = [root];

  for (const token of tokens) {
    let current = stack.at(-1);

    if (token.type === START_TAG) {
      if (current.type === TEXT) {
        stack.pop();
        current = stack.at(-1);
      }
      const node = makeTag(token.tagName);
      if (token.attributes) {
        node.attributes = {};
        for (const attribute of token.attributes) {
          node.attributes[attribute.name] = attribute.value;
        }
      }
      current.children.push(node);
      stack.push(node);
      if (token.selfClosing) {
        stack.pop();
      }
    }
    if (token.type === END_TAG) {
      if (current.type === TEXT) {
        stack.pop();
      }
      stack.pop();
    }
    if (token.type === CHARACTER) {
      // if current node is text, add to it
      if (current.type === TEXT) {
        current.data += token.value;
      } else {
        const node = makeText(token.value);
        current.children.push(node);
        stack.push(node);
      }
    }
  }
  return root;
};

export default tokens => parse(tokenize(tokens));
