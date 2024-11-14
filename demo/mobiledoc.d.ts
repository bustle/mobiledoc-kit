declare class Logger {
    type: string;
    manager: LogManager;
    constructor(type: string, manager: LogManager);
    isEnabled(): boolean;
    log(...args: unknown[]): void;
}
declare class LogManager {
    enabledTypes: string[];
    allEnabled: boolean;
    constructor();
    for(type: string): Logger;
    enableAll(): void;
    enableTypes(types: string[]): void;
    disable(): void;
    isEnabled(type: string): boolean;
}

interface ViewOptions {
    tagName: string;
    container: HTMLElement;
    classNames: string[];
}
declare type EventType = keyof HTMLElementEventMap;
declare class View {
    element: HTMLElement;
    container: HTMLElement;
    isShowing: boolean;
    isDestroyed: boolean;
    _eventListeners: [HTMLElement, EventType, EventListener][];
    constructor(options?: Partial<ViewOptions>);
    addEventListener(element: HTMLElement, type: EventType, listener: EventListener): void;
    removeAllEventListeners(): void;
    show(): true | undefined;
    hide(): true | undefined;
    destroy(): void;
}

declare type EditLinkCallback = () => void;
interface TooltipPlugin {
    renderLink(tooltipEl: Element, linkEl: HTMLLinkElement, options: {
        editLink: EditLinkCallback;
    }): void;
}

declare class LinkedItem {
    next: this | null;
    prev: this | null;
}

declare type Option<T> = T | null;
declare type Maybe<T> = T | null | undefined;
declare type Dict<T> = {
    [key: string]: T;
};
declare type JsonPrimitive = string | number | boolean | null;
declare type JsonArray = JsonData[];
declare type JsonObject = {
    [key: string]: JsonData;
};
declare type JsonData = JsonPrimitive | JsonArray | JsonObject;

interface LinkedListOptions<T> {
    adoptItem?: AdoptItemCallback<T>;
    freeItem?: FreeItemCallback<T>;
}
interface LinkedListItem<T extends LinkedListItem<T>> {
    next: T | null;
    prev: T | null;
}
declare type ItemCallback<T, U = void> = (item: T) => U;
declare type AdoptItemCallback<T> = ItemCallback<T>;
declare type FreeItemCallback<T> = ItemCallback<T>;
declare class LinkedList<T extends LinkedListItem<T>> {
    head: T | null;
    tail: T | null;
    length: number;
    _adoptItem?: AdoptItemCallback<T>;
    _freeItem?: FreeItemCallback<T>;
    constructor(options: LinkedListOptions<T>);
    adoptItem(item: T): void;
    freeItem(item: T): void;
    get isEmpty(): boolean;
    prepend(item: T): void;
    append(item: T): void;
    insertAfter(item: T, prevItem: T): void;
    _ensureItemIsNotAlreadyInList(item: T): void;
    insertBefore(item: T, nextItem?: T | null): void;
    remove(item: T): void;
    forEach(callback: (item: T, idx: number) => void): void;
    map<U>(callback: (item: T) => U): U[];
    walk(startItem: Maybe<T>, endItem: Maybe<T>, callback: ItemCallback<T>): void;
    readRange(startItem?: Maybe<T>, endItem?: Maybe<T>): T[];
    toArray(): T[];
    detect(callback: ItemCallback<T, boolean>, item?: T | null, reverse?: boolean): T | undefined;
    any(callback: ItemCallback<T, boolean>): boolean;
    every(callback: ItemCallback<T, boolean>): boolean;
    objectAt(targetIndex: number): T | undefined;
    splice(targetItem: T, removalCount: number, newItems: T[]): void;
    removeBy(conditionFn: ItemCallback<T, boolean>): void;
    _ensureItemIsNotInList(item: T): void;
    _ensureItemIsInThisList(item: T): void;
}

declare const enum Type {
    MARKUP_SECTION = "markup-section",
    LIST_SECTION = "list-section",
    MARKUP = "markup",
    MARKER = "marker",
    POST = "post",
    LIST_ITEM = "list-item",
    CARD = "card-section",
    IMAGE_SECTION = "image-section",
    ATOM = "atom"
}

/**
 * A Markup is similar with an inline HTML tag that might be added to
 * text to modify its meaning and/or display. Examples of types of markup
 * that could be added are bold ('b'), italic ('i'), strikethrough ('s'), and `a` tags (links).
 * @property {String} tagName
 */
declare class Markup {
    type: string;
    tagName: string;
    attributes: {
        [key: string]: string;
    };
    builder: PostNodeBuilder;
    constructor(tagName: string, attributes?: {});
    /**
     * Whether text in the forward direction of the cursor (i.e. to the right in ltr text)
     * should be considered to have this markup applied to it.
     * @private
     */
    isForwardInclusive(): boolean;
    isBackwardInclusive(): boolean;
    hasTag(tagName: string): boolean;
    /**
     * Returns the attribute value
     * @param {String} name, e.g. "href"
     */
    getAttribute(name: string): string;
    static isValidElement(element: Element): boolean;
}

declare type HasChildSections<T extends Section = Section> = {
    sections: LinkedList<T>;
};

declare enum Direction {
    FORWARD = 1,
    BACKWARD = -1
}

/**
 * A logical range of a {@link Post}.
 * Usually an instance of Range will be read from the {@link Editor#range} property,
 * but it may be useful to instantiate a range directly when programmatically modifying a Post.
 */
declare class Range {
    head: Position;
    tail: Position;
    direction: Option<Direction>;
    /**
     * @param {Position} head
     * @param {Position} [tail=head]
     * @param {Direction} [direction=null]
     * @private
     */
    constructor(head: Position, tail?: Position, direction?: Option<Direction>);
    /**
     * Shorthand to create a new range from a section(s) and offset(s).
     * When given only a head section and offset, creates a collapsed range.
     * @param {Section} headSection
     * @param {number} headOffset
     * @param {Section} [tailSection=headSection]
     * @param {number} [tailOffset=headOffset]
     * @param {Direction} [direction=null]
     * @return {Range}
     */
    static create(headSection: Markerable, headOffset: number, tailSection?: Markerable, tailOffset?: number, direction?: Option<Direction>): Range;
    static blankRange(): Range;
    /**
     * @param {Markerable} section
     * @return {Range} A range that is constrained to only the part that
     * includes the section.
     * FIXME -- if the section isn't the head or tail, it's assumed to be
     * wholly contained. It's possible to call `trimTo` with a selection that is
     * outside of the range, though, which would invalidate that assumption.
     * There's no efficient way to determine if a section is within a range, yet.
     * @private
     */
    trimTo(section: Markerable): Range;
    /**
     * Expands the range 1 unit in the given direction
     * If the range is expandable in the given direction, always returns a
     * non-collapsed range.
     * @param {Number} units If units is > 0, the range is extended to the right,
     *                 otherwise range is extended to the left.
     * @return {Range}
     * @public
     */
    extend(units: number): Range;
    /**
     * Moves this range 1 unit in the given direction.
     * If the range is collapsed, returns a collapsed range shifted by 1 unit,
     * otherwise collapses this range to the position at the `direction` end of the range.
     * Always returns a collapsed range.
     * @param {Direction} direction
     * @return {Range}
     * @public
     */
    move(direction: Direction): Range;
    /**
     * expand a range to all markers matching a given check
     *
     * @param {Function} detectMarker
     * @return {Range} The expanded range
     *
     * @public
     */
    expandByMarker(detectMarker: (marker: Markuperable) => boolean): Range;
    private _collapse;
    get focusedPosition(): Position;
    isEqual(other: Range): boolean;
    get isBlank(): boolean;
    get headSection(): Section | null;
    get tailSection(): Section | null;
    get headSectionOffset(): number;
    get tailSectionOffset(): number;
    get isCollapsed(): boolean;
    get headMarker(): Markuperable | null;
    get tailMarker(): Markuperable | null;
    get headMarkerOffset(): number;
    get tailMarkerOffset(): number;
}

declare type Cloneable<T> = T & {
    clone(): Cloneable<T>;
};

declare type SectionCallback = (section: Section, index: number) => void;
/**
 * The Post is an in-memory representation of an editor's document.
 * An editor always has a single post. The post is organized into a list of
 * sections. Each section may be markerable (contains "markers", aka editable
 * text) or non-markerable (e.g., a card).
 * When persisting a post, it must first be serialized (loss-lessly) into
 * mobiledoc using {@link Editor#serialize}.
 */
declare class Post implements HasChildSections<Cloneable<Section>> {
    type: Type;
    builder: PostNodeBuilder;
    sections: LinkedList<Cloneable<Section>>;
    renderNode: RenderNode;
    constructor();
    /**
     * @return {Position} The position at the start of the post (will be a {@link BlankPosition}
     * if the post is blank)
     * @public
     */
    headPosition(): Position;
    /**
     * @return {Position} The position at the end of the post (will be a {@link BlankPosition}
     * if the post is blank)
     * @public
     */
    tailPosition(): Position;
    /**
     * @return {Range} A range encompassing the entire post
     * @public
     */
    toRange(): Range;
    get isBlank(): boolean;
    /**
     * If the post has no sections, or only has one, blank section, then it does
     * not have content and this method returns false. Otherwise it is true.
     * @return {Boolean}
     * @public
     */
    get hasContent(): boolean;
    /**
     * @param {Range} range
     * @return {Array} markers that are completely contained by the range
     */
    markersContainedByRange(range: Range): Array<any>;
    markupsInRange(range: Range): Markup[];
    walkAllLeafSections(callback: SectionCallback): void;
    walkLeafSections(range: Range, callback: SectionCallback): void;
    walkMarkerableSections(range: Range, callback: (section: Markerable) => void): void;
    _nextLeafSection(section: Section): Option<Section>;
    /**
     * @param {Range} range
     * @return {Post} A new post, constrained to {range}
     */
    trimTo(range: Range): Post;
}

declare class Cursor {
    editor: Editor;
    renderTree: RenderTree;
    post: Post;
    constructor(editor: Editor);
    clearSelection(): void;
    /**
     * @return {Boolean} true when there is either a collapsed cursor in the
     * editor's element or a selection that is contained in the editor's element
     */
    hasCursor(): boolean;
    hasSelection(): boolean;
    /**
     * @return {Boolean} Can the cursor be on this element?
     */
    isAddressable(element: Node): boolean;
    get offsets(): Range;
    _findNodeForPosition(position: Position): {
        node: Node | null;
        offset: number;
    };
    selectRange(range: Range): void;
    get selection(): Selection;
    selectedText(): string;
    /**
     * @param {textNode} node
     * @param {integer} offset
     * @param {textNode} endNode
     * @param {integer} endOffset
     * @param {integer} direction forward or backward, default forward
     * @private
     */
    _moveToNode(node: Text, offset: number, endNode: Text, endOffset: number, direction?: Direction): void;
    _hasSelection(): boolean;
    _hasCollapsedSelection(): boolean;
    get _selectionRange(): globalThis.Range | null;
}

declare class Marker extends Markuperable {
    type: Type;
    isMarker: boolean;
    value: string;
    builder: PostNodeBuilder;
    markups: Markup[];
    renderNode: RenderNode | null;
    constructor(value?: string, markups?: Markup[]);
    clone(): Marker;
    get isEmpty(): boolean;
    get isBlank(): boolean;
    /**
     * A marker's text is equal to its value.
     * Compare with an Atom which distinguishes between text and value
     */
    get text(): string;
    get length(): number;
    deleteValueAtOffset(offset: number): number;
    canJoin(other: Marker): boolean;
    textUntil(offset: number): string;
    split(offset?: number, endOffset?: number): [Marker, Marker, Marker];
    /**
     * @return {Array} 2 markers either or both of which could be blank
     */
    splitAtOffset(offset: number): [Marker, Marker];
}

declare type MarkerableType = Type.LIST_ITEM | Type.MARKUP_SECTION;
declare const Markerable_base: abstract new (...args: any[]) => {
    _tagName: string | null;
    tagName: string;
    isValidTagName(normalizedTagName: string): boolean;
    type: Type;
    isSection: boolean;
    isMarkerable: boolean;
    isNested: boolean;
    isListItem: boolean;
    isListSection: boolean;
    isLeafSection: boolean;
    isCardSection: boolean;
    attributes?: Dict<string> | undefined;
    post?: Option<Post> | undefined;
    renderNode: RenderNode<Node>;
    _parent: Option<Post | (Section & HasChildSections<any>)>;
    builder: PostNodeBuilder;
    readonly parent: Post | (Section & HasChildSections<any>);
    readonly isBlank: boolean;
    readonly length: number;
    headPosition(): Position;
    tailPosition(): Position;
    toPosition(offset: number): Position;
    toRange(): Range;
    splitMarkerAtOffset(_offset: number): {
        added: Markuperable[];
        removed: Markuperable[];
    };
    nextLeafSection(): Section | null;
    immediatelyNextMarkerableSection(): Section | null;
    previousLeafSection(): Section | null;
    next: any | null;
    prev: any | null;
};
declare abstract class Markerable extends Markerable_base implements Cloneable<Markerable> {
    type: MarkerableType;
    markers: LinkedList<Markuperable>;
    constructor(type: MarkerableType, tagName: string, markers?: Markuperable[]);
    canJoin(other: Markerable): boolean;
    clone(): this;
    get isBlank(): boolean;
    textUntil(position: Position): string;
    /**
     * @param {Marker}
     * @param {Number} markerOffset The offset relative to the start of the marker
     *
     * @return {Number} The offset relative to the start of this section
     */
    offsetOfMarker(marker: Markuperable, markerOffset?: number): number;
    _redistributeMarkers(beforeSection: Markerable, afterSection: Markerable, marker: Marker, offset?: number): [Section, Section];
    abstract splitAtMarker(marker: Markuperable, offset: number): [Section, Section];
    /**
     * Split this section's marker (if any) at the given offset, so that
     * there is now a marker boundary at that offset (useful for later applying
     * a markup to a range)
     * @param {Number} sectionOffset The offset relative to start of this section
     * @return {EditObject} An edit object with 'removed' and 'added' keys with arrays of Markers. The added markers may be blank.
     * After calling `splitMarkerAtOffset(offset)`, there will always be a valid
     * result returned from `markerBeforeOffset(offset)`.
     */
    splitMarkerAtOffset(sectionOffset: number): {
        added: Markuperable[];
        removed: Markuperable[];
    };
    splitAtPosition(position: Position): [Section, Section];
    markerBeforeOffset(sectionOffset: number): Markuperable | undefined;
    markerPositionAtOffset(offset: number): {
        marker: Markuperable;
        offset: number;
    };
    get text(): string;
    get length(): number;
    /**
     * @return {Array} New markers that match the boundaries of the
     * range. Does not change the existing markers in this section.
     */
    markersFor(headOffset: number, tailOffset: number): Markuperable[];
    markupsInRange(range: Range): Markup[];
    _markersInRange(range: Range, callback: (marker: Markuperable, info: {
        markerHead: number;
        markerTail: number;
        isContained: boolean;
    }) => void): void;
    join(otherSection: Markerable): {
        beforeMarker: Markuperable | null;
        afterMarker: null;
    };
}

declare type MarkupCallback = (markup: Markup) => boolean;
declare type MarkupOrMarkupCallback = Markup | MarkupCallback;
declare abstract class Markuperable {
    markups: Markup[];
    prev: this | null;
    next: this | null;
    isAtom: boolean;
    isMarker: boolean;
    section: Option<Markerable>;
    parent: Option<Markerable>;
    renderNode: RenderNode | null;
    abstract text: string;
    abstract value: string;
    abstract type: Type;
    abstract length: number;
    abstract clone(): Markuperable;
    abstract isBlank: boolean;
    abstract canJoin(other: Markuperable): boolean;
    abstract textUntil(offset: number): string;
    abstract splitAtOffset(offset: number): [Markuperable, Markuperable];
    charAt(offset: number): string;
    clearMarkups(): void;
    addMarkup(markup: Markup): void;
    addMarkupAtIndex(markup: Markup, index: number): void;
    removeMarkup(markupOrMarkupCallback: MarkupOrMarkupCallback): void;
    _removeMarkup(markup: Markup): void;
    hasMarkup(tagNameOrMarkup: string | Markup): boolean;
    getMarkup(tagNameOrMarkup: string | Markup): Markup | undefined;
    get openedMarkups(): Markup[];
    get closedMarkups(): Markup[];
}

declare type AtomPayload = {};
declare class Atom extends Markuperable {
    type: Type;
    isAtom: boolean;
    name: string;
    value: string;
    text: string;
    payload: {};
    markups: Markup[];
    builder: PostNodeBuilder;
    constructor(name: string, value: string, payload: AtomPayload, markups?: Markup[]);
    clone(): Atom;
    get isBlank(): boolean;
    get length(): number;
    canJoin(): boolean;
    textUntil(): string;
    split(offset?: number, endOffset?: number): Markuperable[];
    splitAtOffset(offset: number): [Markuperable, Markuperable];
}

declare class ListItem extends Markerable {
    isListItem: boolean;
    isNested: boolean;
    section: Section | null;
    parent: ListSection;
    constructor(tagName: string, markers?: Markuperable[]);
    isValidTagName(normalizedTagName: string): boolean;
    splitAtMarker(marker: Marker, offset?: number): [Section, Section];
    get post(): Option<Post> | undefined;
}

declare const ListSection_base: new (...args: any[]) => {
    _tagName: string | null;
    tagName: string;
    isValidTagName(normalizedTagName: string): boolean;
    type: Type;
    isSection: boolean;
    isMarkerable: boolean;
    isNested: boolean;
    isListItem: boolean;
    isListSection: boolean;
    isLeafSection: boolean;
    isCardSection: boolean;
    attributes?: Dict<string> | undefined;
    post?: Option<Post> | undefined;
    renderNode: RenderNode<Node>;
    _parent: Option<Post | (Section & HasChildSections<any>)>;
    builder: PostNodeBuilder;
    readonly parent: Post | (Section & HasChildSections<any>);
    readonly isBlank: boolean;
    readonly length: number;
    headPosition(): Position;
    tailPosition(): Position;
    toPosition(offset: number): Position;
    toRange(): Range;
    splitMarkerAtOffset(_offset: number): {
        added: Markuperable[];
        removed: Markuperable[];
    };
    nextLeafSection(): Section | null;
    immediatelyNextMarkerableSection(): Section | null;
    previousLeafSection(): Section | null;
    next: any | null;
    prev: any | null;
} & Attributable;
declare class ListSection extends ListSection_base implements HasChildSections<ListItem> {
    isListSection: boolean;
    isLeafSection: boolean;
    items: LinkedList<ListItem>;
    sections: LinkedList<ListItem>;
    constructor(tagName?: string, items?: ListItem[], attributes?: {});
    canJoin(): boolean;
    isValidTagName(normalizedTagName: string): boolean;
    headPosition(): Position;
    tailPosition(): Position;
    get isBlank(): boolean;
    clone(): ListSection;
    /**
     * Mutates this list
     * @param {ListSection|Markerable}
     * @return null
     */
    join(other: ListSection | Markerable): void;
}

declare class Image extends Section {
    src: Option<string>;
    constructor();
    clone(): Image;
    canJoin(): boolean;
    get length(): number;
}

/**
 * The PostNodeBuilder is used to create new {@link Post} primitives, such
 * as a MarkupSection, a CardSection, a Markup, etc. Every instance of an
 * {@link Editor} has its own builder instance. The builder can be used
 * inside an {@link Editor#run} callback to programmatically create new
 * Post primitives to insert into the document.
 * A PostNodeBuilder should be read from the Editor, *not* instantiated on its own.
 */
declare class PostNodeBuilder {
    markupCache: Dict<Markup>;
    /**
     * @return {Post} A new, blank post
     */
    createPost(sections?: Cloneable<Section>[]): Post;
    createMarkerableSection(type: Type.LIST_ITEM, tagName: string, markers: Markuperable[]): ListItem;
    createMarkerableSection(type: Type.MARKUP_SECTION, tagName: string, markers: Markuperable[]): MarkupSection;
    createMarkerableSection(type: Exclude<Type, Type.LIST_ITEM & Type.MARKUP_SECTION>, tagName: string, markers: Markuperable[]): never;
    createMarkupSection(tagName?: string, markers?: Markuperable[], isGenerated?: boolean, attributes?: {}): MarkupSection;
    createListSection(tagName?: string, items?: ListItem[], attributes?: {}): ListSection;
    createListItem(markers?: Markuperable[]): ListItem;
    createImageSection(url: string): Image;
    createCardSection(name: string, payload?: CardPayload): Card;
    createMarker(value?: string, markups?: Markup[]): Marker;
    createAtom(name: string, value?: string, payload?: AtomPayload, markups?: Markup[]): Atom;
    /**
     * @param {String} tagName
     * @param {Object} attributes Key-value pairs of attributes for the markup
     * @return {Markup}
     */
    createMarkup(tagName: string, attributes?: Dict<string>): Markup;
}
declare type PostNode = Post | Section | Markuperable | Marker;

declare enum CardMode {
    DISPLAY = "display",
    EDIT = "edit"
}
declare type CardPayload = {};
declare class Card<T extends {} = CardPayload> extends Section {
    name: string;
    payload: T;
    builder: PostNodeBuilder;
    _initialMode: CardMode;
    isCardSection: boolean;
    constructor(name: string, payload: T);
    textUntil(): string;
    canJoin(): boolean;
    get length(): number;
    clone(): Card<CardPayload>;
    /**
     * set the mode that this will be rendered into initially
     * @private
     */
    setInitialMode(initialMode: CardMode): void;
}

declare type CardNodeOptions = Dict<unknown>;
declare type CardRenderHook = (...args: any[]) => void | Maybe<Element>;
declare type DidRenderCallback = null | (() => void);
declare type TeardownCallback$1 = null | (() => void);
declare type CardDataType = 'dom';
interface CardData {
    name: string;
    type?: CardDataType;
    render: CardRenderHook;
    edit?: CardRenderHook;
}
declare class CardNode {
    editor: any;
    card: CardData;
    section: Card;
    element: Element;
    options?: CardNodeOptions;
    mode: CardMode;
    _rendered: Element | null;
    _teardownCallback: TeardownCallback$1;
    _didRenderCallback: DidRenderCallback;
    constructor(editor: any, card: CardData, section: Card, element: Element, options?: CardNodeOptions);
    render(mode: CardMode): void;
    teardown(): void;
    didRender(): void;
    get env(): {
        name: string;
        isInEditor: boolean;
        onTeardown: (callback: TeardownCallback$1) => TeardownCallback$1;
        didRender: (callback: DidRenderCallback) => DidRenderCallback;
        edit: () => void;
        save: (payload: {}, transition?: boolean) => void;
        cancel: () => void;
        remove: () => void;
        postModel: Card<CardPayload>;
    };
    display(): void;
    edit(): void;
    remove(): void;
    _validateAndAppendRenderResult(rendered: Maybe<Element>): void;
}

declare type AtomOptions = Dict<unknown>;
declare type TeardownCallback = () => void;
interface AtomRenderOptions {
    options: AtomOptions;
    env: any;
    value: unknown;
    payload: JsonData;
}
declare type AtomRenderHook = (options: AtomRenderOptions) => Maybe<Element | Text> | void;
declare type AtomData = {
    name: string;
    type: 'dom';
    render: AtomRenderHook;
};
declare class AtomNode {
    editor: any;
    atom: AtomData;
    model: Atom;
    element: Element;
    atomOptions: AtomOptions;
    _teardownCallback: TeardownCallback | null;
    _rendered: Maybe<Node>;
    constructor(editor: any, atom: AtomData, model: Atom, element: Element, atomOptions: AtomOptions);
    render(): void;
    get env(): {
        name: string;
        onTeardown: (callback: TeardownCallback) => TeardownCallback;
        save: (value: string, payload?: {}) => void;
    };
    teardown(): void;
    _validateAndAppendRenderResult(rendered: Node): void;
}

declare class RenderNode<T extends Node = Node> extends LinkedItem {
    parent: Option<RenderNode>;
    isDirty: boolean;
    isRemoved: boolean;
    postNode: Option<PostNode>;
    renderTree: Option<RenderTree>;
    markupElement: Option<Node>;
    headTextNode: Option<Text>;
    tailTextNode: Option<Text>;
    atomNode: Option<AtomNode>;
    cardNode: Option<CardNode>;
    _childNodes: Option<LinkedList<RenderNode>>;
    _element: Option<T>;
    _cursorElement: Option<Node>;
    constructor(postNode: PostNode, renderTree: RenderTree);
    isAttached(): boolean;
    get childNodes(): LinkedList<RenderNode>;
    scheduleForRemoval(): void;
    markDirty(): void;
    get isRendered(): boolean;
    markClean(): void;
    get element(): Option<T>;
    set element(element: Option<T>);
    set cursorElement(cursorElement: Node | null);
    get cursorElement(): Node | null;
    destroy(): void;
    reparsesMutationOfChildNode(node: Node): boolean;
}

declare class ElementMap<T> {
    _map: {
        [key: string]: T;
    };
    set(key: object, value: T): void;
    get(key: object): T | null;
    remove(key: object): void;
}

declare class RenderTree {
    _rootNode: RenderNode;
    _elements: ElementMap<RenderNode>;
    constructor(rootPostNode: Post);
    get rootNode(): RenderNode<Node>;
    /**
     * @return {Boolean}
     */
    get isDirty(): boolean;
    get rootElement(): Option<Node>;
    getElementRenderNode(element: Node): RenderNode<Node> | null;
    setElementRenderNode(element: Node, renderNode: RenderNode): void;
    removeElementRenderNode(element: Node): void;
    /**
     * @param {DOMNode} element
     * Walk up from the dom element until we find a renderNode element
     */
    findRenderNodeFromElement(element: Node, conditionFn?: (node: RenderNode) => boolean): RenderNode<Node> | undefined;
    buildRenderNode(postNode: PostNode): RenderNode<Node>;
}

interface Editor$1 {
    element: HTMLElement;
    _renderTree: RenderTree;
}
declare class Position {
    section: Section | null;
    offset: number;
    isBlank: boolean;
    /**
     * A position is a logical location (zero-width, or "collapsed") in a post,
     * typically between two characters in a section.
     * Two positions (a head and a tail) make up a {@link Range}.
     * @constructor
     */
    constructor(section: Section | null, offset?: number, isBlank?: boolean);
    /**
     * @param {integer} x x-position in current viewport
     * @param {integer} y y-position in current viewport
     * @param {Editor} editor
     * @return {Position|null}
     */
    static atPoint(x: number, y: number, editor: Editor$1): Option<Position>;
    static blankPosition(): Position;
    /**
     * Returns a range from this position to the given tail. If no explicit
     * tail is given this returns a collapsed range focused on this position.
     * @param {Position} [tail=this] The ending position
     * @return {Range}
     * @public
     */
    toRange(tail?: this, direction?: number | null): Range;
    get leafSectionIndex(): number;
    get isMarkerable(): boolean | null;
    /**
     * Returns the marker at this position, in the backward direction
     * (i.e., the marker to the left of the cursor if the cursor is on a marker boundary and text is left-to-right)
     * @return {Marker|undefined}
     */
    get marker(): Markuperable | null;
    /**
     * Returns the marker in `direction` from this position.
     * If the position is in the middle of a marker, the direction is irrelevant.
     * Otherwise, if the position is at a boundary between two markers, returns the
     * marker to the left if `direction` === BACKWARD and the marker to the right
     * if `direction` === FORWARD (assuming left-to-right text direction).
     * @param {Direction}
     * @return {Marker|undefined}
     */
    markerIn(direction: number): Markuperable | null | undefined;
    get offsetInMarker(): number;
    isEqual(position: Position): boolean;
    /**
     * @return {Boolean} If this position is at the head of the post
     */
    isHeadOfPost(): boolean;
    /**
     * @return {Boolean} If this position is at the tail of the post
     */
    isTailOfPost(): boolean;
    /**
     * @return {Boolean} If this position is at the head of its section
     */
    isHead(): boolean;
    /**
     * @return {Boolean} If this position is at the tail of its section
     */
    isTail(): boolean;
    /**
     * Move the position 1 unit in `direction`.
     *
     * @param {Number} units to move. > 0 moves right, < 0 moves left
     * @return {Position} Return a new position one unit in the given
     * direction. If the position is moving left and at the beginning of the post,
     * the same position will be returned. Same if the position is moving right and
     * at the end of the post.
     */
    move(units: number): Position;
    /**
     * @param {Number} direction (FORWARD or BACKWARD)
     * @return {Position} The result of moving 1 "word" unit in `direction`
     */
    moveWord(direction: number): Position;
    /**
     * The position to the left of this position.
     * If this position is the post's headPosition it returns itself.
     * @return {Position}
     * @private
     */
    moveLeft(): Position;
    /**
     * The position to the right of this position.
     * If this position is the post's tailPosition it returns itself.
     * @return {Position}
     * @private
     */
    moveRight(): Position;
    static fromNode(renderTree: RenderTree, node: Node, offset?: number): Position;
    static fromTextNode(renderTree: RenderTree, textNode: Text, offsetInNode?: number): Position;
    static fromElementNode(renderTree: RenderTree, elementNode: Element, offset?: number): Position;
    /**
     * @private
     */
    get markerPosition(): {
        marker: Markuperable;
        offset: number;
    };
}

declare type ParentSection = Post | (Section & HasChildSections<any>);
declare class Section extends LinkedItem {
    type: Type;
    isSection: boolean;
    isMarkerable: boolean;
    isNested: boolean;
    isListItem: boolean;
    isListSection: boolean;
    isLeafSection: boolean;
    isCardSection: boolean;
    attributes?: Dict<string>;
    post?: Option<Post>;
    renderNode: RenderNode;
    _parent: Option<ParentSection>;
    builder: PostNodeBuilder;
    get parent(): Post | (Section & HasChildSections<any>);
    constructor(type: Type);
    get isBlank(): boolean;
    get length(): number;
    /**
     * @return {Position} The position at the start of this section
     * @public
     */
    headPosition(): Position;
    /**
     * @return {Position} The position at the end of this section
     * @public
     */
    tailPosition(): Position;
    /**
     * @param {Number} offset
     * @return {Position} The position in this section at the given offset
     * @public
     */
    toPosition(offset: number): Position;
    /**
     * @return {Range} A range from this section's head to tail positions
     * @public
     */
    toRange(): Range;
    /**
     * Markerable sections should override this method
     */
    splitMarkerAtOffset(_offset: number): {
        added: Markuperable[];
        removed: Markuperable[];
    };
    nextLeafSection(): Section | null;
    immediatelyNextMarkerableSection(): Section | null;
    previousLeafSection(): Section | null;
}

interface Attributable {
    attributes: {
        [key: string]: string;
    };
    hasAttribute: (key: string) => boolean;
    setAttribute: (key: string, value: string) => void;
    removeAttribute: (key: string) => void;
    getAttribute: (key: string) => string;
    eachAttribute: (cb: (key: string, value: string) => void) => void;
}

declare const MarkupSection_base: new (...args: any[]) => Markerable & Attributable;
declare class MarkupSection extends MarkupSection_base {
    isMarkupSection: boolean;
    isGenerated: boolean;
    _inferredTagName: boolean;
    constructor(tagName?: string, markers?: Markuperable[], attributes?: {});
    isValidTagName(normalizedTagName: string): boolean;
    splitAtMarker(marker: Marker, offset?: number): [Section, Section];
}

interface Queue {
    [name: string]: LifecycleCallback[];
}
declare type LifecycleCallback = (...args: any[]) => boolean | void;
declare class LifecycleCallbacks {
    callbackQueues: Queue;
    removalQueues: Queue;
    constructor(queueNames?: string[]);
    runCallbacks(queueName: string, args?: unknown[]): void;
    addCallback(queueName: string, callback: LifecycleCallback): void;
    _scheduleCallbackForRemoval(queueName: string, callback: LifecycleCallback): void;
    addCallbackOnce(queueName: string, callback: LifecycleCallback): void;
    _getQueue(queueName: string): LifecycleCallback[];
}

interface TagNameable {
    tagName: string;
    isValidTagName(normalizedTagName: string): boolean;
}

declare const enum EditAction {
    INSERT_TEXT = 1,
    DELETE = 2
}
interface SectionTransformation {
    from: Section;
    to: Section;
}
/**
 * The PostEditor is used to modify a post. It should not be instantiated directly.
 * Instead, a new instance of a PostEditor is created by the editor and passed
 * as the argument to the callback in {@link Editor#run}.
 *
 * Usage:
 * ```
 * editor.run((postEditor) => {
 *   // postEditor is an instance of PostEditor that can operate on the
 *   // editor's post
 * });
 * ```
 */
declare class PostEditor {
    /**
     * @private
     */
    editor: Editor;
    builder: PostNodeBuilder;
    editActionTaken: Option<EditAction>;
    _callbacks: LifecycleCallbacks;
    _range: Range;
    _didComplete: boolean;
    _renderRange: () => void;
    _postDidChange: () => void;
    _rerender: () => void;
    _shouldCancelSnapshot: boolean;
    constructor(editor: Editor);
    addCallback(queueName: string, callback: LifecycleCallback): void;
    addCallbackOnce(queueName: string, callback: LifecycleCallback): void;
    runCallbacks(queueName: string): void;
    begin(): void;
    /**
     * Schedules to select the given range on the editor after the postEditor
     * has completed its work. This also updates the postEditor's active range
     * (so that multiple calls to range-changing methods on the postEditor will
     * update the correct range).
     *
     * Usage:
     *   let range = editor.range;
     *   editor.run(postEditor => {
     *     let nextPosition = postEditor.deleteRange(range);
     *
     *     // Will position the editor's cursor at `nextPosition` after
     *     // the postEditor finishes work and the editor rerenders.
     *     postEditor.setRange(nextPosition);
     *   });
     * @param {Range|Position} range
     * @public
     */
    setRange(range: Range | Position): void;
    /**
     * Delete a range from the post
     *
     * Usage:
     * ```
     *     let { range } = editor;
     *     editor.run((postEditor) => {
     *       let nextPosition = postEditor.deleteRange(range);
     *       postEditor.setRange(nextPosition);
     *     });
     * ```
     * @param {Range} range Cursor Range object with head and tail Positions
     * @return {Position} The position where the cursor would go after deletion
     * @public
     */
    deleteRange(range: Range): Position;
    /**
     * Note: This method may replace `section` with a different section.
     *
     * "Cut" out the part of the section inside `headOffset` and `tailOffset`.
     * If section is markerable this splits markers that straddle the head or tail (if necessary),
     * and removes markers that are wholly inside the offsets.
     * If section is a card, this may replace it with a blank markup section if the
     * positions contain the entire card.
     *
     * @param {Section} section
     * @param {Position} head
     * @param {Position} tail
     * @return {Position}
     * @private
     */
    cutSection(section: Section, head: Position, tail: Position): Position;
    _coalesceMarkers(section: Section): void;
    _removeBlankMarkers(section: Markerable): void;
    _joinSimilarMarkers(section: Markerable): void;
    removeMarker(marker: Markuperable): void;
    _scheduleForRemoval(postNode: Exclude<PostNode, Post>): void;
    _joinContiguousListSections(): void;
    _joinListSections(baseList: ListSection, nextList: ListSection): void;
    _markDirty(postNode: PostNode): void;
    /**
     * @param {Position} position object with {section, offset} the marker and offset to delete from
     * @param {Number} direction The direction to delete in (default is BACKWARD)
     * @return {Position} for positioning the cursor
     * @public
     * @deprecated after v0.10.3
     */
    deleteFrom(position: Position, direction?: Direction): Position;
    /**
     * Delete 1 `unit` (can be 'char' or 'word') in the given `direction` at the given
     * `position`. In almost all cases this will be equivalent to deleting the range formed
     * by expanding the position 1 unit in the given direction. The exception is when deleting
     * backward from the beginning of a list item, which reverts the list item into a markup section
     * instead of joining it with its previous list item (if any).
     *
     * Usage:
     *
     *     let position = section.tailPosition();
     *     // Section has text of "Howdy!"
     *     editor.run((postEditor) => {
     *       postEditor.deleteAtPosition(position);
     *     });
     *     // section has text of "Howdy"
     *
     * @param {Position} position The position to delete at
     * @param {Direction} [direction=DIRECTION.BACKWARD] direction The direction to delete in
     * @param {Object} [options]
     * @param {String} [options.unit="char"] The unit of deletion ("word" or "char")
     * @return {Position}
     */
    deleteAtPosition(position: Position, direction?: Direction, { unit }?: {
        unit: TextUnit;
    }): Position;
    _deleteAtPositionBackward(position: Position, unit: TextUnit): Position;
    _deleteAtPositionForward(position: Position, unit: TextUnit): Position;
    /**
     * Split markers at two positions, once at the head, and if necessary once
     * at the tail.
     *
     * Usage:
     * ```
     *     let range = editor.range;
     *     editor.run((postEditor) => {
     *       postEditor.splitMarkers(range);
     *     });
     * ```
     * The return value will be marker object completely inside the offsets
     * provided. Markers outside of the split may also have been modified.
     *
     * @param {Range} markerRange
     * @return {Array} of markers that are inside the split
     * @private
     */
    splitMarkers(range: Range): Markuperable[];
    splitSectionMarkerAtOffset(section: Section, offset: number): void;
    /**
     * Split the section at the position.
     *
     * Usage:
     * ```
     *     let position = editor.cursor.offsets.head;
     *     editor.run((postEditor) => {
     *       postEditor.splitSection(position);
     *     });
     *     // Will result in the creation of two new sections
     *     // replacing the old one at the cursor position
     * ```
     * The return value will be the two new sections. One or both of these
     * sections can be blank (contain only a blank marker), for example if the
     * headMarkerOffset is 0.
     *
     * @param {Position} position
     * @return {Array} new sections, one for the first half and one for the second (either one can be null)
     * @public
     */
    splitSection(position: Position): [Option<Section>, Option<Section>];
    /**
     * @param {Section} cardSection
     * @param {Position} position to split at
     * @return {Section[]} 2-item array of pre and post-split sections
     * @private
     */
    _splitCardSection(cardSection: Card, position: Position): [Section, Section];
    /**
     * @param {Section} section
     * @param {Section} newSection
     * @public
     */
    replaceSection(section: Section, newSection: Section): void;
    moveSectionBefore(collection: LinkedList<Cloneable<Section>>, renderedSection: Cloneable<Section>, beforeSection: Section): Cloneable<Section>;
    /**
     * @param {Section} section A section that is already in DOM
     * @public
     */
    moveSectionUp(renderedSection: Cloneable<Section>): Cloneable<Section>;
    /**
     * @param {Section} section A section that is already in DOM
     * @public
     */
    moveSectionDown(renderedSection: Cloneable<Section>): Cloneable<Section>;
    /**
     * Insert an array of markers at the given position. If the position is in
     * a non-markerable section (like a card section), this method throws an error.
     *
     * @param {Position} position
     * @param {Marker[]} markers
     * @return {Position} The position that represents the end of the inserted markers.
     * @public
     */
    insertMarkers(position: Position, markers: Markuperable[]): Position;
    /**
     * Inserts text with the given markups, ignoring the existing markups at
     * the position, if any.
     *
     * @param {Position} position
     * @param {String} text
     * @param {Markup[]} markups
     * @return {Position} position at the end of the inserted text
     */
    insertTextWithMarkup(position: Position, text: string, markups?: Markup[]): Maybe<Position>;
    /**
     * Insert the text at the given position
     * Inherits the markups already at that position, if any.
     *
     * @param {Position} position
     * @param {String} text
     * @return {Position} position at the end of the inserted text.
     */
    insertText(position: Position, text: string): Maybe<Position>;
    _replaceSection(section: Section, newSections: Section[]): void;
    /**
     * Given a markerRange (for example `editor.range`) mark all markers
     * inside it as a given markup. The markup must be provided as a post
     * abstract node.
     *
     * Usage:
     *
     *     let range = editor.range;
     *     let strongMarkup = editor.builder.createMarkup('strong');
     *     editor.run((postEditor) => {
     *       postEditor.addMarkupToRange(range, strongMarkup);
     *     });
     *     // Will result some markers possibly being split, and the markup
     *     // being applied to all markers between the split.
     *
     * @param {Range} range
     * @param {Markup} markup A markup post abstract node
     * @public
     */
    addMarkupToRange(range: Range, markup: Markup): void;
    /**
     * Given a markerRange (for example `editor.range`) remove the given
     * markup from all contained markers.
     *
     * Usage:
     * ```
     *     let { range } = editor;
     *     let markup = markerRange.headMarker.markups[0];
     *     editor.run(postEditor => {
     *       postEditor.removeMarkupFromRange(range, markup);
     *     });
     *     // Will result in some markers possibly being split, and the markup
     *     // being removed from all markers between the split.
     * ```
     * @param {Range} range Object with offsets
     * @param {Markup|Function} markupOrCallback A markup post abstract node or
     * a function that returns true when passed a markup that should be removed
     * @private
     */
    removeMarkupFromRange(range: Range, markupOrMarkupCallback: ((markup: Markup) => boolean) | Markup): void;
    /**
     * Toggle the given markup in the given range (or at the position given). If the range/position
     * has the markup, the markup will be removed. If nothing in the range/position
     * has the markup, the markup will be added to everything in the range/position.
     *
     * Usage:
     * ```
     * // Remove any 'strong' markup if it exists in the selection, otherwise
     * // make it all 'strong'
     * editor.run(postEditor => postEditor.toggleMarkup('strong'));
     *
     * // add/remove a link to 'bustle.com' to the selection
     * editor.run(postEditor => {
     *   const linkMarkup = postEditor.builder.createMarkup('a', {href: 'http://bustle.com'});
     *   postEditor.toggleMarkup(linkMarkup);
     * });
     * ```
     * @param {Markup|String} markupOrString Either a markup object created using
     * the builder (useful when adding a markup with attributes, like an 'a' markup),
     * or, if a string, the tag name of the markup (e.g. 'strong', 'em') to toggle.
     * @param {Range|Position} range in which to toggle. Defaults to current editor range.
     * @public
     */
    toggleMarkup(markupOrMarkupString: Markup | string, range?: Range | Position): void;
    /**
     * Toggles the tagName of the active section or sections in the given range/position.
     * If every section has the tag name, they will all be reset to default sections.
     * Otherwise, every section will be changed to the requested type
     *
     * @param {String} sectionTagName A valid markup section or
     *        list section tag name (e.g. 'blockquote', 'h2', 'ul')
     * @param {Range|Position} range The range over which to toggle.
     *        Defaults to the current editor range.
     * @public
     */
    toggleSection(sectionTagName: string, range?: Range | Position): void;
    _determineNextRangeAfterToggleSection(range: Range, sectionTransformations: SectionTransformation[]): Range;
    setAttribute(key: string, value: string, range?: Range): void;
    removeAttribute(key: string, range?: Range): void;
    _mutateAttribute(key: string, range: Range, cb: (section: Attributable, attribute: string) => boolean | void): void;
    _isSameSectionType(section: Section & TagNameable, sectionTagName: string): boolean;
    /**
     * @param {Markerable} section
     * @private
     */
    changeSectionTagName(section: Markerable & TagNameable, newTagName: string): Markerable | ListSection | MarkupSection;
    /**
     * Splits the item at the position given.
     * If the position is at the start or end of the item, the pre- or post-item
     * will contain a single empty ("") marker.
     * @param {ListItem} item
     * @param {Position} position
     * @return {Array} the pre-item and post-item on either side of the split
     * @private
     */
    _splitListItem(item: ListItem, position: Position): [ListItem, ListItem];
    /**
     * Splits the list at the position given.
     * @return {Array} pre-split list and post-split list, either of which could
     * be blank (0-item list) if the position is at the start or end of the list.
     *
     * Note: Contiguous list sections will be joined in the before_complete queue
     * of the postEditor.
     *
     * @private
     */
    _splitListAtPosition(list: ListSection, position: Position): [ListSection, ListSection];
    /**
     * @return Array of [prev, mid, next] lists. `prev` and `next` can
     *         be blank, depending on the position of `item`. `mid` will always
     *         be a 1-item list containing `item`. `prev` and `next` will be
     *         removed in the before_complete queue if they are blank
     *         (and still attached).
     *
     * @private
     */
    _splitListAtItem(list: ListSection, item: ListItem): ListSection[];
    _changeSectionFromListItem(section: Section, newTagName: string): MarkupSection;
    _changeSectionToListItem(section: ListSection | Markerable, newTagName: string): Markerable | ListSection;
    /**
     * Insert a given section before another one, updating the post abstract
     * and the rendered UI.
     *
     * Usage:
     * ```
     *     let markerRange = editor.range;
     *     let sectionWithCursor = markerRange.headMarker.section;
     *     let section = editor.builder.createCardSection('my-image');
     *     let collection = sectionWithCursor.parent.sections;
     *     editor.run((postEditor) => {
     *       postEditor.insertSectionBefore(collection, section, sectionWithCursor);
     *     });
     * ```
     * @param {LinkedList} collection The list of sections to insert into
     * @param {Object} section The new section
     * @param {Object} beforeSection Optional The section "before" is relative to,
     *        if falsy the new section will be appended to the collection
     * @public
     */
    insertSectionBefore(collection: LinkedList<Section> | LinkedList<Cloneable<Section>>, section: Section, beforeSection?: Option<Section>): void;
    /**
     * Insert the given section after the current active section, or, if no
     * section is active, at the end of the document.
     * @param {Section} section
     * @public
     */
    insertSection(section: Section): void;
    /**
     * Insert the given section at the end of the document.
     * @param {Section} section
     * @public
     */
    insertSectionAtEnd(section: Section): void;
    /**
     * Insert the `post` at the given position in the editor's post.
     * @param {Position} position
     * @param {Post} post
     * @private
     */
    insertPost(position: Position, newPost: Post): Position;
    /**
     * Remove a given section from the post abstract and the rendered UI.
     *
     * Usage:
     * ```
     *     let { range } = editor;
     *     let sectionWithCursor = range.head.section;
     *     editor.run((postEditor) => {
     *       postEditor.removeSection(sectionWithCursor);
     *     });
     * ```
     * @param {Object} section The section to remove
     * @public
     */
    removeSection(section: Section): void;
    removeAllSections(): void;
    migrateSectionsFromPost(post: Post): void;
    _scheduleListRemovalIfEmpty(listSection: ListSection): void;
    /**
     * A method for adding work the deferred queue
     *
     * @param {Function} callback to run during completion
     * @param {Boolean} [once=false] Whether to only schedule the callback once.
     * @public
     */
    schedule(callback: LifecycleCallback, once?: boolean): void;
    /**
     * A method for adding work the deferred queue. The callback will only
     * be added to the queue once, even if `scheduleOnce` is called multiple times.
     * The function cannot be an anonymous function.
     *
     * @param {Function} callback to run during completion
     * @public
     */
    scheduleOnce(callback: LifecycleCallback): void;
    /**
     * Add a rerender job to the queue
     *
     * @public
     */
    scheduleRerender(): void;
    /**
     * Schedule a notification that the post has been changed.
     * The notification will result in the editor firing its `postDidChange`
     * hook after the postEditor completes its work (at the end of {@link Editor#run}).
     *
     * @public
     */
    scheduleDidUpdate(): void;
    scheduleAfterRender(callback: LifecycleCallback, once?: boolean): void;
    /**
     * Flush any work on the queue. {@link Editor#run} calls this method; it
     * should not be called directly.
     *
     * @private
     */
    complete(): void;
    undoLastChange(): void;
    redoLastChange(): void;
    cancelSnapshot(): void;
}

declare const enum MobiledocSectionKind {
    MARKUP = 1,
    IMAGE = 2,
    LIST = 3,
    CARD = 10
}
declare const enum MobiledocMarkerKind {
    MARKUP = 0,
    ATOM = 1
}

declare const MOBILEDOC_VERSION$4 = "0.2.0";
declare type MobiledocMarker$1 = [number[], number, string];
declare type MobiledocMarkerType$1 = [string, string[]?];
declare type MobiledocMarkupSection$1 = [MobiledocSectionKind.MARKUP, string, MobiledocMarker$1[]];
declare type MobiledocListSection$1 = [MobiledocSectionKind.LIST, string, MobiledocMarker$1[][]];
declare type MobiledocImageSection$1 = [MobiledocSectionKind.IMAGE, string];
declare type MobiledocCardSection$1 = [MobiledocSectionKind.CARD, string, {}];
declare type MobiledocSection$1 = MobiledocMarkupSection$1 | MobiledocListSection$1 | MobiledocImageSection$1 | MobiledocCardSection$1;
interface MobiledocV0_2 {
    version: typeof MOBILEDOC_VERSION$4;
    sections: [MobiledocMarkerType$1[], MobiledocSection$1[]];
}

declare const MOBILEDOC_VERSION$3 = "0.3.0";
declare type MobiledocMarkupMarker = [MobiledocMarkerKind.MARKUP, number[], number, string];
declare type MobiledocAtomMarker = [MobiledocMarkerKind.ATOM, number[], number, number];
declare type MobiledocMarker = MobiledocMarkupMarker | MobiledocAtomMarker;
declare type MobiledocMarkupSection = [MobiledocSectionKind.MARKUP, string, MobiledocMarker[]];
declare type MobiledocListSection = [MobiledocSectionKind.LIST, string, MobiledocMarker[][]];
declare type MobiledocImageSection = [MobiledocSectionKind.IMAGE, string];
declare type MobiledocCardSection = [MobiledocSectionKind.CARD, number];
declare type MobiledocSection = MobiledocMarkupSection | MobiledocListSection | MobiledocImageSection | MobiledocCardSection;
declare type MobiledocAtom = [string, string, {}];
declare type MobiledocCard = [string, {}];
declare type MobiledocMarkerType = [string, string[]?];
interface MobiledocV0_3 {
    version: typeof MOBILEDOC_VERSION$3;
    atoms: MobiledocAtom[];
    cards: MobiledocCard[];
    markups: MobiledocMarkerType[];
    sections: MobiledocSection[];
}

declare const MOBILEDOC_VERSION$2 = "0.3.1";
interface MobiledocV0_3_1 {
    version: typeof MOBILEDOC_VERSION$2;
    atoms: MobiledocAtom[];
    cards: MobiledocCard[];
    markups: MobiledocMarkerType[];
    sections: MobiledocSection[];
}

declare const MOBILEDOC_VERSION$1 = "0.3.2";
declare type MobiledocAttributedMarkupSection = [MobiledocSectionKind.MARKUP, string, MobiledocMarker[], string[]];
declare type MobiledocAttributedListSection = [MobiledocSectionKind.LIST, string, MobiledocMarker[][], string[]];
declare type MobiledocAttributedSection = MobiledocSection | MobiledocAttributedMarkupSection | MobiledocAttributedListSection;
interface MobiledocV0_3_2 {
    version: typeof MOBILEDOC_VERSION$1;
    atoms: MobiledocAtom[];
    cards: MobiledocCard[];
    markups: MobiledocMarkerType[];
    sections: MobiledocAttributedSection[];
}

declare type Mobiledoc = MobiledocV0_2 | MobiledocV0_3 | MobiledocV0_3_1 | MobiledocV0_3_2;
declare const MOBILEDOC_VERSION = "0.3.2";
interface VersionTypes {
    [MOBILEDOC_VERSION$4]: MobiledocV0_2;
    [MOBILEDOC_VERSION$3]: MobiledocV0_3;
    [MOBILEDOC_VERSION$2]: MobiledocV0_3_1;
    [MOBILEDOC_VERSION$1]: MobiledocV0_3_2;
}
declare type MobiledocVersion = keyof VersionTypes;
declare const MobiledocRenderer: {
    render(post: Post, version?: keyof VersionTypes): MobiledocV0_2 | MobiledocV0_3 | MobiledocV0_3_1 | MobiledocV0_3_2;
};

interface KeyCommand {
    name?: string;
    str: string;
    run(editor: Editor): boolean | void;
    /** @internal */
    modifier?: string;
}
interface CompiledKeyCommand {
    name?: string;
    run(editor: Editor): boolean | void;
    /** @internal */
    modifier?: string;
    modifierMask: number;
    code: number;
}

declare class MutationHandler {
    editor: Editor;
    logger: Logger;
    renderTree: Option<RenderTree>;
    _isObserving: boolean;
    _observer: Option<MutationObserver>;
    constructor(editor: Editor);
    init(): void;
    destroy(): void;
    suspendObservation(callback: () => void): void;
    stopObserving(): void;
    startObserving(): void;
    reparsePost(): void;
    reparseSections(sections: Section[]): void;
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
    _handleMutations(mutations: MutationRecord[]): void;
    _findTargetNodes(mutation: MutationRecord): Node[];
    _findSectionRenderNodeFromNode(node: Node): RenderNode<Node> | undefined;
    _findRenderNodeFromNode(node: Node): RenderNode<Node> | undefined;
    _findSectionFromRenderNode(renderNode: RenderNode): Section | undefined;
}

declare class FixedQueue<T> {
    _maxLength: number;
    _items: T[];
    constructor(length?: number);
    get length(): number;
    pop(): T | undefined;
    push(item: T): void;
    clear(): void;
    toArray(): T[];
}

declare class Snapshot {
    takenAt: number;
    editor: Editor;
    editAction: Option<EditAction>;
    mobiledoc: Mobiledoc;
    range: {
        head: [number, number];
        tail: [number, number];
    };
    constructor(takenAt: number, editor: Editor, editAction?: Option<EditAction>);
    snapshotRange(): void;
    getRange(post: Post): Range | undefined;
    groupsWith(groupingTimeout: number, editAction: Option<EditAction>, takenAt: number): boolean;
}
declare class EditHistory {
    editor: Editor;
    _undoStack: FixedQueue<Snapshot>;
    _redoStack: FixedQueue<Snapshot>;
    _pendingSnapshot: Option<Snapshot>;
    _groupingTimeout: number;
    constructor(editor: Editor, queueLength: number, groupingTimeout: number);
    snapshot(): void;
    storeSnapshot(editAction?: Option<EditAction>): void;
    stepBackward(postEditor: PostEditor): void;
    stepForward(postEditor: PostEditor): void;
    _restoreFromSnapshot(snapshot: Snapshot, postEditor: PostEditor): void;
}

interface BaseHandler {
    name: string;
    run: (editor: Editor, matches: string[]) => void;
}
interface TextHandler extends BaseHandler {
    text: string;
}
interface MatchHandler extends BaseHandler {
    match: RegExp;
}
declare type TextInputHandlerListener = TextHandler | MatchHandler;

declare const ELEMENT_EVENT_TYPES: readonly ["keydown", "keyup", "cut", "copy", "paste", "keypress", "drop", "compositionstart", "compositionend"];
declare global {
    interface HTMLElementEventMap {
        compositionstart: CompositionEvent;
        compositionend: CompositionEvent;
    }
}
declare type DOMEventType = typeof ELEMENT_EVENT_TYPES[number];
declare type DOMEventForType<T extends DOMEventType> = HTMLElementEventMap[T];

/**
 * parses an element into a section, ignoring any non-markup
 * elements contained within
 * @private
 */
interface SectionParserOptions {
    plugins?: SectionParserPlugin[];
}
interface SectionParserState {
    section?: Cloneable<Section> | null;
    text?: string;
    markups?: Markup[];
}
interface SectionParseEnv {
    addSection: (section: Cloneable<Section>) => void;
    addMarkerable: (marker: Marker) => void;
    nodeFinished(): void;
}
declare type SectionParserPlugin = (node: Node, builder: PostNodeBuilder, env: SectionParseEnv) => void;
declare type SectionParserNode = HTMLElement | Text | Comment;
declare class SectionParser {
    builder: PostNodeBuilder;
    plugins: SectionParserPlugin[];
    sections: Cloneable<Section>[];
    state: SectionParserState;
    constructor(builder: PostNodeBuilder, options?: SectionParserOptions);
    parse(element: HTMLElement): Cloneable<Section>[];
    runPlugins(node: Node): boolean;
    parseNode(node: SectionParserNode): void;
    parseElementNode(element: HTMLElement): void;
    parseTextNode(textNode: Text): void;
    _updateStateFromElement(element: SectionParserNode): void;
    _closeCurrentSection(): void;
    _markupsFromElement(element: HTMLElement | Text): Markup[];
    _isValidMarkupForElement(tagName: string, element: HTMLElement): boolean;
    _markupsFromElementStyle(element: HTMLElement): Markup[];
    _createMarker(): void;
    _getSectionDetails(element: HTMLElement | Text): {
        sectionType: string;
        tagName: string;
        inferredTagName: boolean;
    };
    _createSectionFromElement(element: Comment | HTMLElement): Cloneable<Section> | undefined;
    _isSkippable(element: Node): boolean;
}

interface ForEachable<T> {
    forEach(cb: (val: T, idx: number) => void): void;
}

interface EditorOptions {
    parserPlugins?: SectionParserPlugin[];
    placeholder?: string;
    spellcheck?: boolean;
    autofocus?: boolean;
    showLinkTooltips?: boolean;
    undoDepth?: number;
    undoBlockTimeout?: number;
    cards?: CardData[];
    atoms?: AtomData[];
    cardOptions?: {};
    unknownCardHandler?: CardRenderHook;
    unknownAtomHandler?: CardRenderHook;
    mobiledoc?: Option<Mobiledoc>;
    html?: Option<string>;
    tooltipPlugin?: TooltipPlugin;
    /** @internal */
    nodeType?: number;
}
declare enum Format {
    MOBILEDOC = "mobiledoc",
    HTML = "html",
    TEXT = "text"
}
interface SerializeOptions {
    version?: MobiledocVersion;
}
declare enum TextUnit {
    CHAR = "char",
    WORD = "word"
}
interface DeleteOperation {
    direction: Direction;
    unit: TextUnit;
}
/**
 * The Editor is a core component of mobiledoc-kit. After instantiating
 * an editor, use {@link Editor#render} to display the editor on the web page.
 *
 * An editor uses a {@link Post} internally to represent the displayed document.
 * The post can be serialized as mobiledoc using {@link Editor#serialize}. Mobiledoc
 * is the transportable "over-the-wire" format (JSON) that is suited for persisting
 * and sharing between editors and renderers (for display, e.g.), whereas the Post
 * model is better suited for programmatic editing.
 *
 * The editor will call registered callbacks for certain state changes. These are:
 *   * {@link Editor#cursorDidChange} -- The cursor position or selection changed.
 *   * {@link Editor#postDidChange} -- The contents of the post changed due to user input or
 *     programmatic editing. This hook can be used with {@link Editor#serialize}
 *     to auto-save a post as it is being edited.
 *   * {@link Editor#inputModeDidChange} -- The active section(s) or markup(s) at the current cursor
 *     position or selection have changed. This hook can be used with
 *     {@link Editor#activeMarkups} and {@link Editor#activeSections} to implement
 *     a custom toolbar.
 *   * {@link Editor#onTextInput} -- Register callbacks when the user enters text
 *     that matches a given string or regex.
 *   * {@link Editor#beforeToggleMarkup} -- Register callbacks that will be run before
 *     applying changes from {@link Editor#toggleMarkup}
 */
declare class Editor implements EditorOptions {
    post: Post;
    cards: CardData[];
    atoms: AtomData[];
    element: HTMLElement;
    isEditable: boolean;
    hasRendered: boolean;
    isDestroyed: boolean;
    undoDepth: number;
    parserPlugins: SectionParserPlugin[];
    placeholder: string;
    spellcheck: boolean;
    autofocus: boolean;
    showLinkTooltips: boolean;
    undoBlockTimeout: number;
    cardOptions: {};
    unknownCardHandler: CardRenderHook;
    unknownAtomHandler: CardRenderHook;
    mobiledoc: Option<Mobiledoc>;
    html: Option<string>;
    text: Option<string>;
    tooltipPlugin: TooltipPlugin;
    private _views;
    private _keyCommands?;
    private _logManager;
    private _parser;
    private _builder;
    private _renderer;
    private _eventManager;
    private _editState;
    private _callbacks;
    private _beforeHooks;
    private _isComposingOnBlankLine;
    /** @private */
    _parserPlugins: SectionParserPlugin[];
    /** @private */
    _renderTree: RenderTree;
    /** @private */
    _editHistory: EditHistory;
    /** @private */
    _mutationHandler: MutationHandler;
    /**
     * @param {Object} [options]
     * @param {Object} [options.mobiledoc] The mobiledoc to load into the editor.
     *        Supersedes `options.html`.
     * @param {String|DOM} [options.html] The html (as a string or DOM fragment)
     *        to parse and load into the editor.
     *        Will be ignored if `options.mobiledoc` is also passed.
     * @param {Array} [options.parserPlugins=[]]
     * @param {Array} [options.cards=[]] The cards that the editor may render.
     * @param {Array} [options.atoms=[]] The atoms that the editor may render.
     * @param {Function} [options.unknownCardHandler] Invoked by the editor's renderer
     *        whenever it encounters an unknown card.
     * @param {Function} [options.unknownAtomHandler] Invoked by the editor's renderer
     *        whenever it encounters an unknown atom.
     * @param {String} [options.placeholder] Default text to show before user starts typing.
     * @param {Boolean} [options.spellcheck=true] Whether to enable spellcheck
     * @param {Boolean} [options.autofocus=true] Whether to focus the editor when it is first rendered.
     * @param {Boolean} [options.showLinkTooltips=true] Whether to show the url tooltip for links
     * @param {number} [options.undoDepth=5] How many undo levels will be available.
     *        Set to 0 to disable undo/redo functionality.
     * @public
     */
    constructor(options?: EditorOptions);
    /**
     * Turns on verbose logging for the editor.
     * @param {Array} [logTypes=[]] If present, only the given log types will be logged.
     * @public
     */
    enableLogging(logTypes?: string[]): void;
    /**
     * Disable all logging
     * @public
     */
    disableLogging(): void;
    /**
     * @private
     */
    loggerFor(type: string): Logger;
    /**
     * The editor's instance of a post node builder.
     * @type {PostNodeBuilder}
     */
    get builder(): PostNodeBuilder;
    loadPost(): Post;
    rerender(): void;
    /**
     * @param {Element} element The DOM element to render into.
     *        Its contents will be replaced by the editor's rendered post.
     * @public
     */
    render(element: HTMLElement): void;
    private _addTooltip;
    get keyCommands(): CompiledKeyCommand[];
    /**
     * @param {Object} keyCommand The key command to register. It must specify a
     * modifier key (meta, ctrl, etc), a string representing the ascii key, and
     * a `run` method that will be passed the editor instance when the key command
     * is invoked
     * @public
     */
    registerKeyCommand(rawKeyCommand: KeyCommand): void;
    /**
     * @param {String} name If the keyCommand event has a name attribute it can be removed.
     * @public
     */
    unregisterKeyCommands(name: string): void;
    /**
     * Convenience for {@link PostEditor#deleteAtPosition}. Deletes and puts the
     * cursor in the new position.
     * @public
     */
    deleteAtPosition(position: Position, direction: number, { unit }: {
        unit: TextUnit;
    }): void;
    /**
     * Convenience for {@link PostEditor#deleteRange}. Deletes and puts the
     * cursor in the new position.
     * @param {Range} range
     * @public
     */
    deleteRange(range: Range): void;
    /**
     * @private
     */
    performDelete({ direction, unit }?: DeleteOperation): void;
    handleNewline(event: KeyboardEvent): void;
    /**
     * Notify the editor that the post did change, and run associated
     * callbacks.
     * @private
     */
    _postDidChange(): void;
    /**
     * Selects the given range or position. If given a collapsed range or a position, this positions the cursor
     * at the range's position. Otherwise a selection is created in the editor
     * surface encompassing the range.
     * @param {Range|Position} range
     */
    selectRange(range: Range | Position): void;
    get cursor(): Cursor;
    /**
     * Return the current range for the editor (may be cached).
     * @return {Range}
     */
    get range(): Range;
    set range(newRange: Range);
    /** @private */
    _readRangeFromDOM(): void;
    setPlaceholder(placeholder: string): void;
    /** @private */
    _reparsePost(): void;
    /** @private */
    _reparseSections(sections?: Section[]): void;
    private _removeDetachedSections;
    /**
     * The sections from the cursor's selection start to the selection end
     * @type {Section[]}
     */
    get activeSections(): Section[];
    get activeSection(): Section;
    get activeSectionAttributes(): Dict<string[]>;
    detectMarkupInRange(range: Range, markupTagName: string): Markup | undefined;
    /**
     * @type {Markup[]}
     * @public
     */
    get activeMarkups(): Markup[];
    /**
     * @param {Markup|String} markup A markup instance, or a string (e.g. "b")
     * @return {boolean}
     */
    hasActiveMarkup(markup: Markup | string): boolean;
    /**
     * @param {String} version The mobiledoc version to serialize to.
     * @return {Mobiledoc} Serialized mobiledoc
     * @public
     */
    serialize(version?: MobiledocVersion): Mobiledoc;
    /**
     * Serialize the editor's post to the requested format.
     * Note that only mobiledoc format is lossless. If cards or atoms are present
     * in the post, the html and text formats will omit them in output because
     * the editor does not have access to the html and text versions of the
     * cards/atoms.
     * @param {string} format The format to serialize ('mobiledoc', 'text', 'html')
     * @return {Object|String} The editor's post, serialized to `format`
     * @public
     */
    serializeTo(format: Format.MOBILEDOC): Mobiledoc;
    serializeTo(format: Format.TEXT | Format.HTML): string;
    /**
     * @param {Post}
     * @param {String} format Same as `serializeTo`
     * @param {Object} [options]
     * @param {String} [options.version=MOBILEDOC_VERSION] version to serialize to
     * @return {Object|String}
     * @private
     */
    serializePost(post: Post, format: Format.MOBILEDOC, options?: SerializeOptions): Mobiledoc;
    serializePost(post: Post, format: Format.TEXT | Format.HTML, options?: SerializeOptions): string;
    serializePost(post: Post, format: Format, options?: SerializeOptions): string | Mobiledoc;
    addView(view: View): void;
    removeAllViews(): void;
    /**
     * Whether the editor has a cursor (or a selected range).
     * It is possible for the editor to be focused but not have a selection.
     * In this case, key events will fire but the editor will not be able to
     * determine a cursor position, so they will be ignored.
     * @return {boolean}
     * @public
     */
    hasCursor(): boolean;
    /**
     * Tears down the editor's attached event listeners and views.
     * @public
     */
    destroy(): void;
    /**
     * Keep the user from directly editing the post using the keyboard and mouse.
     * Modification via the programmatic API is still permitted.
     * @see Editor#enableEditing
     * @public
     */
    disableEditing(): void;
    /**
     * Allow the user to directly interact with editing a post via keyboard and mouse input.
     * Editor instances are editable by default. Use this method to re-enable
     * editing after disabling it.
     * @see Editor#disableEditing
     * @public
     */
    enableEditing(): void;
    /**
     * Change a cardSection into edit mode
     * If called before the card has been rendered, it will be marked so that
     * it is rendered in edit mode when it gets rendered.
     * @param {CardSection} cardSection
     * @public
     */
    editCard(cardSection: Card): void;
    /**
     * Change a cardSection into display mode
     * If called before the card has been rendered, it will be marked so that
     * it is rendered in display mode when it gets rendered.
     * @param {CardSection} cardSection
     * @return undefined
     * @public
     */
    displayCard(cardSection: Card): void;
    /**
     * Run a new post editing session. Yields a block with a new {@link PostEditor}
     * instance. This instance can be used to interact with the post abstract.
     * Rendering will be deferred until after the callback is completed.
     *
     * Usage:
     * ```
     *   let markerRange = this.range;
     *   editor.run((postEditor) => {
     *     postEditor.deleteRange(markerRange);
     *     // editing surface not updated yet
     *     postEditor.schedule(() => {
     *       console.log('logs during rerender flush');
     *     });
     *     // logging not yet flushed
     *   });
     *   // editing surface now updated.
     *   // logging now flushed
     * ```
     *
     * @param {Function} callback Called with an instance of
     *        {@link PostEditor} as its argument.
     * @return {Mixed} The return value of `callback`.
     * @public
     */
    run<T>(callback: (postEditor: PostEditor) => T): T;
    /**
     * @param {Function} callback Called with `postEditor` as its argument.
     * @public
     */
    didUpdatePost(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback Called when the post has changed, either via
     *        user input or programmatically. Use with {@link Editor#serialize} to
     *        retrieve the post in portable mobiledoc format.
     */
    postDidChange(callback: LifecycleCallback): void;
    /**
     * Register a handler that will be invoked by the editor after the user enters
     * matching text.
     * @param {Object} inputHandler
     * @param {String} inputHandler.name Required. Used by identifying handlers.
     * @param {String} [inputHandler.text] Required if `match` is not provided
     * @param {RegExp} [inputHandler.match] Required if `text` is not provided
     * @param {Function} inputHandler.run This callback is invoked with the {@link Editor}
     *                   instance and an array of matches. If `text` was provided,
     *                   the matches array will equal [`text`], and if a `match`
     *                   regex was provided the matches array will be the result of
     *                   `match.exec` on the matching text. The callback is called
     *                   after the matching text has been inserted.
     * @public
     */
    onTextInput(inputHandler: TextInputHandlerListener): void;
    /**
     * Unregister all text input handlers
     *
     * @public
     */
    unregisterAllTextInputHandlers(): void;
    /**
     * Unregister text input handler by name
     * @param {String} name The name of handler to be removed
     *
     * @public
     */
    unregisterTextInputHandler(name: string): void;
    /**
     * @param {Function} callback Called when the editor's state (active markups or
     * active sections) has changed, either via user input or programmatically
     */
    inputModeDidChange(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback This callback will be called before the editor
     *        is rendered.
     * @public
     */
    willRender(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback This callback will be called after the editor
     *        is rendered.
     * @public
     */
    didRender(callback: LifecycleCallback): void;
    willCopy(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback This callback will be called before pasting.
     * @public
     */
    willPaste(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback This callback will be called before deleting.
     * @public
     */
    willDelete(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback This callback will be called after deleting.
     * @public
     */
    didDelete(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback This callback will be called before handling new line.
     * @public
     */
    willHandleNewline(callback: LifecycleCallback): void;
    /**
     * @param {Function} callback This callback will be called every time the cursor
     *        position (or selection) changes.
     * @public
     */
    cursorDidChange(callback: LifecycleCallback): void;
    private _rangeDidChange;
    private _inputModeDidChange;
    /** @private */
    _insertEmptyMarkupSectionAtCursor(): void;
    /**
     * @callback editorBeforeCallback
     * @param { Object } details
     * @param { Markup } details.markup
     * @param { Range } details.range
     * @param { boolean } details.willAdd Whether the markup will be applied
     */
    /**
     * Register a callback that will be run before {@link Editor#toggleMarkup} is applied.
     * If any callback returns literal `false`, the toggling of markup will be canceled.
     * Note this only applies to calling `editor#toggleMarkup`. Using `editor.run` and
     * modifying markup with the `postEditor` will skip any `beforeToggleMarkup` callbacks.
     * @param {editorBeforeCallback}
     */
    beforeToggleMarkup(callback: LifecycleCallback): void;
    /**
     * Toggles the given markup at the editor's current {@link Range}.
     * If the range is collapsed this changes the editor's state so that the
     * next characters typed will be affected. If there is text selected
     * (aka a non-collapsed range), the selections' markup will be toggled.
     * If the editor is not focused and has no active range, nothing happens.
     * Hooks added using #beforeToggleMarkup will be run before toggling,
     * and if any of them returns literal false, toggling the markup will be canceled
     * and no change will be applied.
     * @param markup e.g. "b", "em", "a"
     * @param attributes e.g. `{ href: "https://bdg.com" }`
     * @public
     * @see PostEditor#toggleMarkup
     */
    toggleMarkup(markupOrString: Markup | string, attributes?: Dict<string>): void;
    /** @private */
    _ensureFocus(): void;
    focus(): void;
    /**
     * Whether there is a selection inside the editor's element.
     * It's possible to have a selection but not have focus.
     * @see #_hasFocus
     * @return {Boolean}
     */
    private _hasSelection;
    /**
     * Whether the editor's element is focused
     * It's possible to be focused but have no selection
     * @see #_hasSelection
     * @return {Boolean}
     */
    private _hasFocus;
    /**
     * Toggles the tagName for the current active section(s). This will skip
     * non-markerable sections. E.g. if the editor's range includes a "P" MarkupSection
     * and a CardSection, only the MarkupSection will be toggled.
     * @param {String} tagName The new tagname to change to.
     * @public
     * @see PostEditor#toggleSection
     */
    toggleSection(tagName: string): void;
    /**
     * Sets an attribute for the current active section(s).
     *
     * @param {String} key The attribute. The only valid attribute is 'text-align'.
     * @param {String} value The value of the attribute.
     * @public
     * @see PostEditor#setAttribute
     */
    setAttribute(key: string, value: string): void;
    /**
     * Removes an attribute from the current active section(s).
     *
     * @param {String} key The attribute. The only valid attribute is 'text-align'.
     * @public
     * @see PostEditor#removeAttribute
     */
    removeAttribute(key: string): void;
    /**
     * Finds and runs the first matching key command for the event
     *
     * If multiple commands are bound to a key combination, the
     * first matching one is run.
     *
     * If a command returns `false` then the next matching command
     * is run instead.
     *
     * @param {Event} event The keyboard event triggered by the user
     * @return {Boolean} true when a command was successfully run
     * @private
     */
    handleKeyCommand(event: KeyboardEvent): boolean;
    /**
     * Inserts the text at the current cursor position. If the editor has
     * no current cursor position, nothing will be inserted. If the editor's
     * range is not collapsed, it will be deleted before insertion.
     *
     * @param {String} text
     * @public
     */
    insertText(text: string): void;
    /**
     * Inserts an atom at the current cursor position. If the editor has
     * no current cursor position, nothing will be inserted. If the editor's
     * range is not collapsed, it will be deleted before insertion.
     * @return The inserted atom.
     */
    insertAtom(atomName: string, atomText?: string, atomPayload?: AtomPayload): Maybe<Atom>;
    /**
     * Inserts a card at the section after the current cursor position. If the editor has
     * no current cursor position, nothing will be inserted. If the editor's
     * range is not collapsed, it will be deleted before insertion. If the cursor is in
     * a blank section, it will be replaced with a card section.
     * The editor's cursor will be placed at the end of the inserted card.
     * @param {String} cardName
     * @param {Object} cardPayload
     * @param {Boolean} inEditMode Whether the card should be inserted in edit mode.
     * @return The inserted Card section.
     */
    insertCard(cardName: string, cardPayload?: CardPayload, inEditMode?: boolean): Maybe<Card>;
    /**
     * @param {integer} x x-position in viewport
     * @param {integer} y y-position in viewport
     * @return {Position|null}
     */
    positionAtPoint(x: number, y: number): Position | null;
    private _setCardMode;
    triggerEvent(context: HTMLElement, eventName: DOMEventType, event: DOMEventForType<typeof eventName>): void;
    addCallback(queueName: string, callback: LifecycleCallback): void;
    addCallbackOnce(queueName: string, callback: LifecycleCallback): void;
    runCallbacks(queueName: string, args?: unknown[]): void;
    /**
     * Runs each callback for the given hookName.
     * Only the hookName 'toggleMarkup' is currently supported
     * @return {Boolean} shouldCancel Whether the action in `hookName` should be canceled
     */
    private _runBeforeHooks;
}

declare const ImageCard: CardData;

/**
 * @module UI
 */

declare type ShowPromptCallback = (message: string, defaultValue: string, callback: (value: string | null) => void) => void;
/**
 * @callback promptCallback
 * @param {String} url The URL to pass back to the editor for linking
 *        to the selected text.
 */
/**
 * @callback showPrompt
 * @param {String} message The text of the prompt.
 * @param {String} defaultValue The initial URL to display in the prompt.
 * @param {module:UI~promptCallback} callback Once your handler has accepted a URL,
 *        it should pass it to `callback` so that the editor may link the
 *        selected text.
 */
/**
 * Exposes the core behavior for linking and unlinking text, and allows for
 * customization of the URL input handler.
 * @param {Editor} editor An editor instance to operate on. If a range is selected,
 *        either prompt for a URL and add a link or un-link the
 *        currently linked text.
 * @param {module:UI~showPrompt} [showPrompt] An optional custom input handler. Defaults
 *        to using `window.prompt`.
 * @example
 * let myPrompt = (message, defaultURL, promptCallback) => {
 *   let url = window.prompt("Overriding the defaults", "http://placekitten.com");
 *   promptCallback(url);
 * };
 *
 * editor.registerKeyCommand({
 *   str: "META+K",
 *   run(editor) {
 *     toggleLink(editor, myPrompt);
 *   }
 * });
 * @public
 */
declare function toggleLink(editor: Editor, showPrompt?: ShowPromptCallback): void;
/**
 * Exposes the core behavior for editing an existing link, and allows for
 * customization of the URL input handler.
 * @param {HTMLAnchorElement} target The anchor (<a>) DOM element whose URL should be edited.
 * @param {Editor} editor An editor instance to operate on. If a range is selected,
 *        either prompt for a URL and add a link or un-link the
 *        currently linked text.
 * @param {module:UI~showPrompt} [showPrompt] An optional custom input handler. Defaults
 *        to using `window.prompt`.
 *
 * @public
 */
declare function editLink(target: HTMLAnchorElement, editor: Editor, showPrompt?: ShowPromptCallback): void;

declare const ui_toggleLink: typeof toggleLink;
declare const ui_editLink: typeof editLink;
declare namespace ui {
  export {
    ui_toggleLink as toggleLink,
    ui_editLink as editLink,
  };
}

/** @private */
declare class MobiledocError extends Error {
}

/**
 * Parses DOM element -> Post
 * @private
 */
declare class DOMParser {
    builder: PostNodeBuilder;
    sectionParser: SectionParser;
    constructor(builder: PostNodeBuilder, options?: {});
    parse(element: HTMLElement): Post;
    appendSections(post: Post, sections: ForEachable<Cloneable<Section>>): void;
    appendSection(post: Post, section: Cloneable<Section>): void;
    _eachChildNode(element: Node, callback: (element: Node) => void): void;
    parseSections(element: HTMLElement): Cloneable<Section>[];
    collectMarkups(textNode: Text, rootNode: Node): Markup[];
    markupFromNode(node: Node): Markup | undefined;
    reparseSection(section: Section, renderTree: RenderTree): void;
    reparseMarkupSection(section: MarkupSection, renderTree: RenderTree): void;
    reparseListItem(listItem: ListItem, renderTree: RenderTree): void;
    reparseListSection(listSection: ListSection, renderTree: RenderTree): void;
    _reparseSectionContainingMarkers(section: Markerable, renderTree: RenderTree): void;
}

export { DOMParser, Editor, MobiledocError as Error, ImageCard, MOBILEDOC_VERSION, Markup, Position, PostNodeBuilder, Range, MobiledocRenderer as Renderer, ui as UI };
