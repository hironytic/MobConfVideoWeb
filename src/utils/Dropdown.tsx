//
// Dropdown.tsx
//
// Copyright (c) 2018-2022 Hironori Ichimiya <hiron@hironytic.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//


import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

export interface DropdownState {
  value: string;
  items: DropdownStateItem[];
}

interface DropdownStateItem {
  value: string;
  title: string;
}

interface DropdownProps {
  labelId: string;
  label: string;
  state: DropdownState;
  minWidth?: number | string;
  onChange: (value: string) => void;
}

export function Dropdown({ labelId, label, state, minWidth, onChange }: DropdownProps): JSX.Element {
  return (
    <FormControl sx={{ minWidth }}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select labelId={labelId} label={label} value={state.value} onChange={event => onChange(event.target.value)}>
        {
          state.items.map(item => (
            <MenuItem key={item.value} value={item.value}>
              {item.title}
            </MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
}
