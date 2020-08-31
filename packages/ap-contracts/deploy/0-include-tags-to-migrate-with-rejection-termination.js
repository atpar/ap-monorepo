// Make node.js terminate on unhandled rejections, and run "migrate"
module.exports = async () => await Promise.resolve();
module.exports.tags = ["migrate-terminate"];
module.exports.dependencies = [
    "_terminate-on-rejections",
    "migrate"
];
