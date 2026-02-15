import { ExecutionGraph, NodeId } from "../types";

const path: NodeId[] = [
  "keyboard",
  "keyboard_controller",
  "hardware_interrupt",
  "kernel_input_handler",
  "scheduler",
  "application_layer",
  "cpu_fetch",
  "cpu_decode",
  "cpu_execute"
];

export const executionGraph: ExecutionGraph = {
  startNode: "keyboard",
  path,
  nodes: {
    keyboard: {
      id: "keyboard",
      label: "Keyboard",
      kind: "hardware",
      x: 90,
      y: 90,
      tooltip: "A key press generates an electrical scan signal.",
      baseLatencyMs: 110,
      opsCost: 420
    },
    keyboard_controller: {
      id: "keyboard_controller",
      label: "Keyboard Controller",
      kind: "hardware",
      x: 290,
      y: 90,
      tooltip: "Firmware/controller translates scan code and raises an interrupt.",
      baseLatencyMs: 130,
      opsCost: 880
    },
    hardware_interrupt: {
      id: "hardware_interrupt",
      label: "Hardware Interrupt",
      kind: "hardware",
      x: 500,
      y: 90,
      tooltip: "CPU is notified that input is ready via an interrupt line.",
      baseLatencyMs: 90,
      opsCost: 1350
    },
    kernel_input_handler: {
      id: "kernel_input_handler",
      label: "Kernel Input Handler",
      kind: "kernel",
      x: 700,
      y: 150,
      tooltip: "Kernel interrupt service routine reads and normalizes key data.",
      baseLatencyMs: 170,
      opsCost: 2200
    },
    scheduler: {
      id: "scheduler",
      label: "Scheduler",
      kind: "kernel",
      x: 700,
      y: 330,
      tooltip: "Scheduler decides which waiting thread should process the event.",
      baseLatencyMs: 150,
      opsCost: 1900
    },
    application_layer: {
      id: "application_layer",
      label: "Application Layer",
      kind: "application",
      x: 500,
      y: 390,
      tooltip: "Target app receives Enter and executes its handler logic.",
      baseLatencyMs: 180,
      opsCost: 2700
    },
    cpu_fetch: {
      id: "cpu_fetch",
      label: "CPU Fetch",
      kind: "cpu",
      x: 300,
      y: 390,
      tooltip: "Instruction bytes are fetched from cache or memory.",
      baseLatencyMs: 120,
      opsCost: 1600
    },
    cpu_decode: {
      id: "cpu_decode",
      label: "CPU Decode",
      kind: "cpu",
      x: 140,
      y: 320,
      tooltip: "Control logic decodes opcode and required operands.",
      baseLatencyMs: 110,
      opsCost: 1700
    },
    cpu_execute: {
      id: "cpu_execute",
      label: "CPU Execute",
      kind: "cpu",
      x: 90,
      y: 210,
      tooltip: "ALU/units execute operations and commit architectural changes.",
      baseLatencyMs: 130,
      opsCost: 2400
    }
  },
  edges: path.slice(0, -1).map((from, i) => ({
    id: `${from}->${path[i + 1]}`,
    from,
    to: path[i + 1],
    latencyMs: 170 + i * 25
  }))
};
