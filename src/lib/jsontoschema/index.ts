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

import { stringifySchema } from './stringifySchema'
import { schemaClassification } from './schemaClassification';

import { toSchema } from './toSchema'

const safeFnExecute = <T>(fn:() => T) => {
  try {
    return { value: fn() as T };
  } catch (error:any) {
    return { error };
  }
};

const validateJson = (jsonInput:any) => {
  const { error: jsonError, value } = safeFnExecute(() =>
    JSON.parse(jsonInput)
  );

  if (jsonError) {
    jsonError.message = `Invalid JSON received: ${jsonInput}, error: ${jsonError.message}`;
    return { error: jsonError };
  }

  if (!value) {
    return { error: new Error(`Invalid JSON received: ${jsonInput}`) };
  }

  return { value };
};

const jsonToSchema = ({
  baseType = "AutogeneratedMainType",
  prefix = "",
  jsonInput,
}:{baseType:string,prefix:string,jsonInput:any}) => {
  let values = jsonInput;
  if(typeof jsonInput === 'string') {
    const { error,value } = validateJson(jsonInput);
    if (error) {
      return { error };
    }
    values = value;
  }

  return safeFnExecute(() =>{
    const schema = toSchema(values);
    console.log(schema)
    return stringifySchema(baseType, prefix,schema)
  }
    
  );
};

const jsonToTC = ({
  baseType = "AutogeneratedMainType",
  prefix = "",
  jsonInput,
}:{baseType:string,prefix:string,jsonInput:any}) => {
  let values = jsonInput;
  if(typeof jsonInput === 'string') {
    const { error,value } = validateJson(jsonInput);
    if (error) {
      return { error };
    }
    values = value;
  }

  return safeFnExecute(() =>{
    const schema = toSchema(values);
    console.log(schema)
    return schemaClassification(baseType, prefix,schema)
  }
    
  );
};

export {   
  jsonToSchema,
  validateJson,
  jsonToTC
}
