/**
 * Copyright (c) [2018]-present, Walmart Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License."
 * 
 * modified by dennis ko 07 21 2023
 * 
 */


type combineAccumType = {
  [key:string]: {
    full: string
    name: string
    amtFields: number
    idx: number
  }
}

type combineIdenticalType = {
  [key:string]: string[]
}

const combineTypes = (str:string) => {
  
  const tempCombine = ` ${str}`.split(" type ").filter((i) => i)
  const reduceResult = tempCombine.reduce((accum, fragment, idx) => {
    const full = `type ${fragment}`.trim()

    const fragmentArr:string[] = fragment
    .trim()
    .split(" ")
    .map((s) => s.trim());
    const name = fragmentArr.shift() ?? '';
    const amtFields = fragmentArr.filter((s) => s.indexOf(":") > -1).length;

    if (!accum[name as keyof typeof accum] || accum[name as keyof typeof accum].amtFields < amtFields) {
      accum[name as keyof typeof accum] = { full, name, amtFields, idx };
    }

    return accum
  },{} as combineAccumType)
  return reduceResult
}


const extractPossibleIdenticalTypes = (str:string) =>
  str
    .split("type ")
    // clear empty lines
    .filter((i) => i)
    .reduce((accum, fragment) => {
      const fragmentArr = fragment
        .trim()
        .split(" ")
        .map((s) => s.trim());
      const name = fragmentArr.shift() ?? '';
      const fieldsSignature = fragmentArr.join(" ");

      if (!accum[fieldsSignature as keyof typeof accum]) {
        accum[fieldsSignature as keyof typeof accum] = [name];
        return accum;
      }

      if (accum[fieldsSignature as keyof typeof accum].indexOf(name) === -1) {
        accum[fieldsSignature].push(name);
      }
      return accum;
    }, {} as combineIdenticalType);

const removeDuplicateTypes = (str:string) => {
  const schemaStr = Object.values(combineTypes(str))
    .sort((a0, a1) => a0.idx - a1.idx)
    .map(({ full }) => full)
    .join("\n\n");

  const probablyDuplicates = Object.values(
    extractPossibleIdenticalTypes(schemaStr)
  )
    .filter((arr) => arr.length > 1)
    .map((arr) => `# ${arr.join(" ")}`)
    .join("\n");

  return `${schemaStr}${
    probablyDuplicates
      ? `\n\n# Types with identical fields:\n${probablyDuplicates}`
      : ""
  }`;
};

export { removeDuplicateTypes };
