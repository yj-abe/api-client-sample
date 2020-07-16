import 'reflect-metadata';

import { HttpParams } from '@angular/common/http';
import { ApiClient } from './api-client';

// 各引数を保存しておくためのキーの定義。
const clientSymbol = Symbol('client');
const pathSymbol = Symbol('path');
const querySymbol = Symbol('query');
const bodySymbol = Symbol('body');

/**
 * パスパラメータを使ってパスを置換し、最終的なパスを作成する。
 * ex. example/:id -> example/123
 */
function generatePath(replacedPath: string, paths: Path[], args: any[]): string {
  let generatedPath: string = replacedPath;
  if (paths != null) {
    paths.forEach(path => {
      const value = args[path.index];
      generatedPath = generatedPath.replace(`:${path.name}`, `${value}`);
    });
  }
  return generatedPath;
}

/**
 * クエリパラメータからHttpParamsを作成する。
 */
function generateHttpParams(queries: Query[], args: any[]): HttpParams {
  if (queries == null) {
    return null;
  }
  let params = new HttpParams();
  queries.forEach(query => {
    const value = args[query.index];
    if (value != null) {
      params = params.set(query.name, `${value}`);
    }
  });
  return params;
}

/**
 * パスパラメータを表現するデータ。
 */
interface Path {
  name: string;
  index: number;
}

/**
 * URLに付与されるクエリパラメータを表現するデータ。
 */
interface Query {
  name: string;
  index: number;
}

/**
 * GETリクエストを定義するためのメソッドデコレータ
 * @param path APIのパス
 */
export function Get(path: string): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    descriptor.value = (...args: any[]) => {
      // 引数で指定されたパスパラメータを取得する
      const paths: Path[] = Reflect.getOwnMetadata(pathSymbol, target, propertyKey);
      // 指定されたパスに置換用のパラメータが設定されている場合はパスパラメータで置換する。
      const pathToApi = generatePath(path, paths, args);
      // 引数で指定されたクエリパラメータを取得する。
      const queries: Query[] = Reflect.getOwnMetadata(querySymbol, target, propertyKey);
      // クエリストリングとして設定するパラメータを作成する。
      const params = generateHttpParams(queries, args);
      // HTTPリクエストを実行するためのクライアントオブジェクトを取得する。
      const clientIndex = Reflect.getOwnMetadata(clientSymbol, target, propertyKey);
      const client = args[clientIndex] as ApiClient;
      // GETリクエストを実行する。
      return client.get(pathToApi, params);
    };
  };
}

/**
 * POSTリクエストを定義するためのメソッドデコレータ
 * @param path APIのパス
 */
export function Post(path: string): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    descriptor.value = (...args: any[]) => {
      const paths: Path[] = Reflect.getOwnMetadata(pathSymbol, target, propertyKey);
      const pathToApi = generatePath(path, paths, args);
      // リクエストボディとして設定するオブジェクトを取得する。
      const bodyIndex = Reflect.getOwnMetadata(bodySymbol, target, propertyKey);
      const body = args[bodyIndex];
      const clientIndex = Reflect.getOwnMetadata(clientSymbol, target, propertyKey);
      const client = args[clientIndex] as ApiClient;
      return client.post(pathToApi, body);
    };
  };
}

/**
 * PUTリクエストを定義するためのメソッドデコレータ
 * @param path APIのパス
 */
export function Put(path: string): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    descriptor.value = (...args: any[]) => {
      const paths: Path[] = Reflect.getOwnMetadata(pathSymbol, target, propertyKey);
      const pathToApi = generatePath(path, paths, args);
      const bodyIndex = Reflect.getOwnMetadata(bodySymbol, target, propertyKey);
      const body = bodyIndex != null ? args[bodyIndex] : null;
      const clientIndex = Reflect.getOwnMetadata(clientSymbol, target, propertyKey);
      const client = args[clientIndex] as ApiClient;
      return client.put(pathToApi, body);
    };
  };
}

/**
 * DELETEリクエストを定義するためのメソッドデコレータ
 * @param path APIのパス
 */
export function Delete(path: string): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) => {
    descriptor.value = (...args: any[]) => {
      const paths: Path[] = Reflect.getOwnMetadata(pathSymbol, target, propertyKey);
      const pathToApi = generatePath(path, paths, args);
      const clientIndex = Reflect.getOwnMetadata(clientSymbol, target, propertyKey);
      const client = args[clientIndex] as ApiClient;
      return client.delete(pathToApi);
    };
  };
}

/**
 * パスパラメータを指定するためのパラメータデコレータ。
 * Get、Post、Put、Deleteのpathに、":hoge"の様に指定した文字列にこのデコレータで指定した引数をマッピング出来る。
 * マッピングを指定するにはこのデコレータの引数に ":" を抜いた同じ文字列を指定する必要がある。
 *
 * ex.
 *
 * \@Get('example/:id')
 * example(@Path('id') id: string) {・・・・ }
 *
 * @param aName パラメータ名
 */
export function Path(aName: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    // ターゲットに対するパス用のメタデータが既にあれば取得する。ない場合は初期化する。
    const paths: Path[] = Reflect.getOwnMetadata(pathSymbol, target, propertyKey) || [];
    // Getなどのデコレータでパスを構築するのに使用するためメタデータに指定されたパスパラメータの名前と引数のインデックスを保存しておく。
    paths.push({
      name: aName,
      index: parameterIndex
    });
    // メタデータを保存する。
    Reflect.defineMetadata(pathSymbol, paths, target, propertyKey);
  };
}

/**
 * クエリパラメータを指定するためのパラメータデコレータ。
 * 指定した名前で、指定された引数をクエリストリングとしてURLに追加する。
 *
 * @param aName パラメータ名
 */
export function Query(aName: string): ParameterDecorator {
  return (target, propertyKey, parameterIndex) => {
    const queries: Query[] = Reflect.getOwnMetadata(querySymbol, target, propertyKey) || [];
    queries.push({
      name: aName,
      index: parameterIndex
    });
    Reflect.defineMetadata(querySymbol, queries, target, propertyKey);
  };
}

/**
 * Post、Putでのリクエストボディを指定するためのパラメータデコレータ。
 * 指定したオブジェクトがJsonとしてリクエストボディに設定される。
 */
export function Body(target: any, props: string, index: number): void {
  // Postなどのデコレータからリクエストボディを取得できるようにメタデータに保存しておく。
  Reflect.defineMetadata(bodySymbol, index, target, props);
}

/**
 * ApiClientを指定するためのパラメータデコレータ。
 */
export function Client(target: any, props: string, index: number): void {
  // GetなどのデコレータがApiClientにアクセス出来るようにインデックスをメタデータに保存しておく。
  Reflect.defineMetadata(clientSymbol, index, target, props);
}
