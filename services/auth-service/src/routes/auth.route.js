"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import {
//   getCurrentUser,
//   login,
//   logout,
//   register,
// } from "../controllers/auth.controller";
const router = express_1.default.Router();
// // POST /login
// router.post(
//   "/login",
//   login
// );
// // POST /register
// router.post(
//   "/register",
//   register
// );
// // POST /logout
// router.post("/logout", logout);
// // GET /current-user
// router.get("/current-user", getCurrentUser);
exports.default = router;
