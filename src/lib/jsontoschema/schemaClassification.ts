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

import { pascalCase } from 'pascal-case'
import { removeDuplicateTypes } from './removeDuplicateType'
import { schemaComposer } from 'graphql-compose'

const schemaToTcWrap = (typeName:string,prefix:string,obj:any) => {
  return schelmaToTC(typeName,prefix,obj)
}

const schelmaToTC = (typeName:string, prefix:string, obj:any) => {
  const tempTC = schemaComposer.getOrCreateOTC(`${prefix}${typeName}`)
  Object.keys(obj).forEach((key) => {
    if (Array.isArray(obj[key])) {
      const firstElement = obj[key][0];
      //Array of arrays case
      if (firstElement.length === 1) {
        tempTC.setField(`${prefix}${pascalCase(key)}`,{
          type:`[${firstElement}]`
        })
        return
      }

      // Array of objects case
      if (Array.isArray(firstElement) || typeof firstElement === 'object') {

        const newTypeName = `${prefix}${pascalCase(key)}`;
        schelmaToTC(newTypeName,prefix,firstElement)
        obj[key][0] = newTypeName;
      }

      return "";
    }

    if ( typeof obj[key] === 'object') {
      const newTypeName = `${prefix}${pascalCase(key)}`;

      schelmaToTC(newTypeName,prefix,obj[key])
      obj[key] = newTypeName;
    }

    tempTC.setField(
      key,{
      type:obj[key]
    })
    console.log(tempTC.getTypeName(),'  :  ',key,',',tempTC.getFieldType(key).toString())

    return "";
  });
  return schemaComposer
};

const schemaClassification = (typeName:string, prefix:string, obj:any) => schelmaToTC(typeName, prefix, obj)

export { schemaClassification }