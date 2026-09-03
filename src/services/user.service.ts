import { userModel } from '../models/user.model.js';

export const userService = {
  listTeachers: () => userModel.listTeachers(),
  listStudents: () => userModel.listStudents(),
};
