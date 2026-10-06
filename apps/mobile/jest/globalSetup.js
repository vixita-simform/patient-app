// Dummy data carries IST offsets (+05:30) and tests assert formatted local times,
// so every run uses the same zone regardless of the machine.
module.exports = () => {
  process.env.TZ = "Asia/Kolkata";
};
