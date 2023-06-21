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


import { inspect} from 'util'
import { pascalCase } from 'pascal-case'
import { removeDuplicateTypes } from './removeDuplicateType'

const schemaToString = (typeName:string, prefix:string, obj:any) => {
  let str = "";

  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      const firstElement = obj[key][0];

      //Array of arrays case
      if (firstElement.length === 1) {
        return `${prefix}${pascalCase(key)}: [${firstElement}]`;
      }

      if (Array.isArray(firstElement) || typeof firstElement === 'object') {
        const newTypeName = `${prefix}${pascalCase(key)}`;
        str += schemaToString(newTypeName, prefix, firstElement);
        obj[key][0] = newTypeName;
      }
      return "";
    }

    if ( typeof obj[key] === 'object') {
      const newTypeName = `${prefix}${pascalCase(key)}`;
      str += schemaToString(newTypeName, prefix, obj[key]);
      obj[key] = newTypeName;
    }
    return "";
  });

  const newObjString = inspect(obj, { depth: null, compact: false });

  return `${str}type ${typeName} ${newObjString.replace(/'/g, "")} `
    .replace(/\[\n/g, "[")
    .replace(/\[\s+/g, "[")
    .replace(/\n\s+\]/g, "]")
    .replace(/,/g, "")
    .replace(/ {3,}/g, "  ");
};

const stringifySchema = (typeName:string, prefix:string, obj:any) => removeDuplicateTypes(schemaToString(typeName, prefix, obj))

export { stringifySchema }