const axios = require("axios"),
  jp = require("jsonpath");

module.exports = async function hatch() {
  const { data } = await axios.get(
    "https://hf.space/embed/ronvolutional/ai-pokemon-card/new_card?pull=1&saved=0"
  );
  let creature = {
    name: data.details.name,
    stats: {
      vit: data.details.hp,
      str: jp
        .query(data.details, "$..damage")
        .reduce((a, b) => Number(a) + Number(b), 0),
    },
    image: data.image,
    attachments: [],
  };
  return creature;
};
