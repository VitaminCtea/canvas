enum InputEventType {
    MOUSEEVENT,
    MOUSEDOWN,
    MOUSEUP,
    MOUSEMOVE,
    MOUSEDRAG,
    KEYBOARDEVENT,
    KEYUP,
    KEYDOWN,
    KEYPRESS
}

export class CanvasInputEvent {
    public altKey: boolean
    public ctrlKey: boolean
    public shiftKey: boolean
    public type: InputEventType
    public constructor(
        altKey: boolean = false, 
        ctrlKey: boolean = false, 
        shiftKey: boolean = false, 
        type: InputEventType = InputEventType.MOUSEEVENT
    ) {
        this.altKey = altKey
        this.ctrlKey = ctrlKey
        this.shiftKey = shiftKey
        this.type = type
    }
}
