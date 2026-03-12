import * as $protobuf from "protobufjs";

export interface IMidiNote {
  noteNumber?: number | null;
  velocity?: number | null;
  isNoteOn?: boolean | null;
}

export class MidiNote implements IMidiNote {
  constructor(properties?: IMidiNote);
  public noteNumber: number;
  public velocity: number;
  public isNoteOn: boolean;
  public static create(properties?: IMidiNote): MidiNote;
  public static encode(message: IMidiNote, writer?: $protobuf.Writer): $protobuf.Writer;
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): MidiNote;
  public static verify(message: { [k: string]: unknown }): string | null;
  public static fromObject(object: { [k: string]: unknown }): MidiNote;
  public static toObject(message: MidiNote, options?: $protobuf.IConversionOptions): { [k: string]: unknown };
  public toJSON(): { [k: string]: unknown };
}

export interface IControlChange {
  controlIndex?: number | null;
  level?: number | null;
}

export class ControlChange implements IControlChange {
  constructor(properties?: IControlChange);
  public controlIndex: number;
  public level: number;
  public static create(properties?: IControlChange): ControlChange;
  public static encode(message: IControlChange, writer?: $protobuf.Writer): $protobuf.Writer;
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): ControlChange;
  public static verify(message: { [k: string]: unknown }): string | null;
  public static fromObject(object: { [k: string]: unknown }): ControlChange;
  public static toObject(message: ControlChange, options?: $protobuf.IConversionOptions): { [k: string]: unknown };
  public toJSON(): { [k: string]: unknown };
}

export interface IWrapperMessage {
  midiNote?: IMidiNote | null;
  controlChange?: IControlChange | null;
}

export class WrapperMessage implements IWrapperMessage {
  constructor(properties?: IWrapperMessage);
  public midiNote?: MidiNote | null;
  public controlChange?: ControlChange | null;
  public message?: "midiNote" | "controlChange";
  public static create(properties?: IWrapperMessage): WrapperMessage;
  public static encode(message: IWrapperMessage, writer?: $protobuf.Writer): $protobuf.Writer;
  public static decode(reader: $protobuf.Reader | Uint8Array, length?: number): WrapperMessage;
  public static verify(message: { [k: string]: unknown }): string | null;
  public static fromObject(object: { [k: string]: unknown }): WrapperMessage;
  public static toObject(message: WrapperMessage, options?: $protobuf.IConversionOptions): { [k: string]: unknown };
  public toJSON(): { [k: string]: unknown };
}
