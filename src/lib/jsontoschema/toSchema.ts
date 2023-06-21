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


import _ from 'lodash'

const transformPrimitive = (value:any) => {
  if (typeof value === 'number') {
    Number.isSafeInteger(value) ? 'Int' : 'Float'
    return "Int";
  }
  if (typeof value === 'boolean') {
    return "Boolean";
  }
  return "String";
};

const badTypeNameRegex = /[\W]+/g;

const cleanName = (name:string) => name.replace(badTypeNameRegex, "");

type StackItem = {
  obj: any;
  path: string;
  cleanedPath: string;
}

const toSchema = (input:any[]) => {
  const result = {};
  const processedItemsCache:any[] = [];
  const stack:StackItem[] = [{ obj: input, path: "", cleanedPath: "" }];

  while (stack.length > 0) {
    const tempStack = stack.pop() 
    const { obj, path, cleanedPath } = tempStack as StackItem;

    // eslint-disable-next-line max-statements
    Object.keys(obj).forEach((key) => {
      let currentValue = obj[key];

      if (!Array.isArray(currentValue) && typeof currentValue !== 'object') {
        const newObjValue = transformPrimitive(currentValue);
        const newObjValuePath = cleanedPath ? `${cleanedPath}.` : "";
        // console.log(`${newObjValuePath}${cleanName(key)}`)
        _.set(result, `${newObjValuePath}${cleanName(key)}`, newObjValue);
        return;
      }

      // all this to guard against circular refs
      if (processedItemsCache.some((o) => o === currentValue)) {
        return;
      }

      processedItemsCache.push(currentValue);

      const pathPrefix = path ? `${path}.` : "";
      const newPath = `${pathPrefix}${key}`;

      const cleanedPathPrefix = cleanedPath ? `${cleanedPath}.` : "";
      const newCleanedPath = `${cleanedPathPrefix}${cleanName(key)}`;

      // only use the first element in the array since we're assuming the same type for all
      // array elements
      if (Array.isArray(currentValue)) {
        currentValue = [currentValue[0]];
      }

      stack.push({
        obj: currentValue,
        path: newPath,
        cleanedPath: newCleanedPath,
      });
    });
  }

  processedItemsCache.splice(0, processedItemsCache.length);
  return result;
};

export { toSchema };
