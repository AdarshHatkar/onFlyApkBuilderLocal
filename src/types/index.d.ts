
import type appDataType from '../webApp/middlewares/appUsername';


declare global {
    namespace Express {
        export interface Request {
            appData?: appDataType;

        }
    }
}