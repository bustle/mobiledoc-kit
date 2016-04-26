import Set from 'mobiledoc-kit/utils/set';
import { forEach, filter } from 'mobiledoc-kit/utils/array-utils';
import assert from 'mobiledoc-kit/utils/assert';
import { containsNode } from 'mobiledoc-kit/utils/dom-utils';

const MUTATION = {
  NODES_CHANGED: 'childList',
  CHARACTER_DATA: 'characterData'
};

export default class MutationHandler {
  constructor(editor) {
    this.editor     = editor;
    this.logger     = editor.loggerFor('mutation-handler');
    this.renderTree = null;
    this._isObserving = false;

    this._observer = new MutationObserver((mutations) => {
      this._handleMutations(mutations);
    });
  }

  init() {
    this.startObserving();
  }

  destroy() {
    this.stopObserving();
    this._observer = null;
  }

  suspendObservation(callback) {
    this.stopObserving();
    callback();
    this.startObserving();
  }

  stopObserving() {
    if (this._isObserving) {
      this._isObserving = false;
      this._observer.disconnect();
    }
  }

  startObserving() {
    if (!this._isObserving) {
      let { editor } = this;
      assert('Cannot observe un-rendered editor', editor.hasRendered);

      this._isObserving = true;
      this.renderTree = editor._renderTree;

      this._observer.observe(editor.element, {
        characterData: true,
        childList: true,
        subtree: true
      });
    }
  }

  reparsePost() {
    this.editor._reparsePost();
  }

  reparseSections(sections) {
    this.editor._reparseSections(sections);
  }

  /**
   * for each mutation:
   *   * find the target nodes:
   *     * if nodes changed, target nodes are:
   *        * added nodes
   *        * the target from which removed nodes were removed
   *     * if character data changed
   *       * target node is the mutation event's target (text node)
   *     * filter out nodes that are no longer attached (parentNode is null)
   *   * for each remaining node:
   *   *  find its section, add to sections-to-reparse
   *   *  if no section, reparse all (and break)
   */
  _handleMutations(mutations) {
    let reparsePost = false;
    let sections = new Set();

    for (let i = 0; i < mutations.length; i++) {
      if (reparsePost) {
        break;
      }

      let nodes = this._findTargetNodes(mutations[i]);

      for (let j=0; j < nodes.length; j++) {
        let node = nodes[j];
        let renderNode = this._findRenderNodeFromNode(node);
        if (renderNode) {
          if (renderNode.reparsesMutationOfChildNode(node)) {
            let section = this._findSectionFromRenderNode(renderNode);
            if (section) {
              sections.add(section);
            } else {
              reparsePost = true;
            }
          }
        } else {
          reparsePost = true;
          break;
        }
      }
    }

    if (reparsePost) {
      this.logger.log(`reparsePost (${mutations.length} mutations)`);
      this.reparsePost();
    } else if (sections.length) {
      this.logger.log(`reparse ${sections.length} sections (${mutations.length} mutations)`);
      this.reparseSections(sections.toArray());
    }
  }

  _findTargetNodes(mutation) {
    let nodes = [];

    switch (mutation.type) {
      case MUTATION.CHARACTER_DATA:
        nodes.push(mutation.target);
        break;
      case MUTATION.NODES_CHANGED:
        forEach(mutation.addedNodes, n => nodes.push(n));
        if (mutation.removedNodes.length) {
          nodes.push(mutation.target);
        }
        break;
    }

    let element = this.editor.element;
    let attachedNodes = filter(nodes, node => containsNode(element, node));
    return attachedNodes;
  }

  _findSectionRenderNodeFromNode(node) {
    return this.renderTree.findRenderNodeFromElement(node, (rn) => {
      return rn.postNode.isSection;
    });
  }

  _findRenderNodeFromNode(node) {
    return this.renderTree.findRenderNodeFromElement(node);
  }

  _findSectionFromRenderNode(renderNode) {
    let sectionRenderNode = this._findSectionRenderNodeFromNode(renderNode.element);
    return sectionRenderNode && sectionRenderNode.postNode;
  }

}
