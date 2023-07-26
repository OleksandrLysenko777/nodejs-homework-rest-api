const isValidObjectId = (id) => {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
};
const validId = "64bc308c7ea3e8a8dfbe7f90";
const invalidId = "1234567890";
console.log(isValidObjectId(validId));
console.log(isValidObjectId(invalidId));
module.exports = {
  isValidObjectId,
};
