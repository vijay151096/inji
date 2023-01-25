import { DecodedCredential, VerifiableCredential } from '../types/vc';
import { HOST } from './constants';

export class BackendResponseError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
}

export async function request(
  method: 'GET' | 'POST' | 'PATCH',
  path: `/${string}`,
  body?: Record<string, unknown>
) {
  console.log(`calling ${method} ` + HOST + path);
  console.log(JSON.stringify(body));
  const response = await fetch(HOST + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const jsonResponse = await response.json();

  if (response.status >= 400) {
    console.log('failed with ' + JSON.stringify(jsonResponse));
    throw new Error(jsonResponse.message || jsonResponse.error);
  }

  if (jsonResponse.errors && jsonResponse.errors.length) {
    const { errorCode, errorMessage } = jsonResponse.errors.shift();
    console.log(
      'failed with errorMessage: ' + errorMessage + ' error code : ' + errorCode
    );
    throw new BackendResponseError(errorCode, errorMessage);
  }

  return jsonResponse;
}

interface ResponseError {
  errorCode: string;
  errorMessage: string;
}

interface BackendResponse<T> {
  id: string;
  version: string;
  response: T;
  str?: string;
  responsetime?: string;
  metadata?: string;
  errors?: ResponseError[];
}

export type OtpRequestResponse = BackendResponse<{
  maskedMobile?: string;
  maskedEmail?: string;
}>;

export type VcGenerateResponse = BackendResponse<{
  vc: string;
  message: string;
}>;

export type CredentialRequestResponse = BackendResponse<{
  id: string;
  requestId: string;
}>;

export type CredentialStatusResponse = BackendResponse<{
  statusCode: 'NEW' | 'ISSUED' | 'printing';
}>;

export interface CredentialDownloadResponse {
  credential?: DecodedCredential;
  verifiableCredential?: VerifiableCredential;
}
