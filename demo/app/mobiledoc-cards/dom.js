import inputCard from './dom/input';
import simpleCard from './dom/simple';
import selfieCard from './dom/selfie';
import imageCard from './dom/image';
import codemirrorCard from './dom/codemirror';
import dragoverCard from './dom/dragover';
import createComponentCard from 'ember-mobiledoc-editor/utils/create-component-card';

export default [
  inputCard,
  simpleCard,
  selfieCard,
  imageCard,
  codemirrorCard,
  createComponentCard('ember-card'),
  dragoverCard
];
