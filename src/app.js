import express from 'express';
import createHttpError from 'http-errors';
import si from 'systeminformation';

import cors from 'cors';
import morgan from 'morgan';
import { mainFun } from './mainFun.js';


mainFun();


