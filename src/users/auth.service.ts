import {Injectable} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    decode_token(token: string): number {
        if (!token || !token.startsWith('Bearer ')) {
            return -1;
          }
          
        try {
          if (token.startsWith('Bearer ')) {
            token = token.split(' ')[1];
          }
          // Decode the token without verifying
          const decoded = jwt.decode(token);
          if (decoded && typeof decoded !== 'string' && 'sub' in decoded) {
            const userId = decoded.sub;
            return Number(userId);
          } else {
            return -1;
          }
        } catch (error) {
          return -1;
        }
      }
}