const axios = require("axios"),
  jp = require("jsonpath");

module.exports =
  /**
   * Hatch a new creature
   * @param {string} hatcher
   * @returns {Promise<{
   *     name: string,
   *     description: string,
   *     hatcher: string,
   *     stats: {
   *        vit: number,
   *        str: number,
   *      },
   *     image: string,
   *     attachments: Any[]
   *   }>
   * }
   */
  async function hatch(hatcher) {
    if (!hatcher) {
      throw new Error("No hatcher provided");
    }
    const { data } = await axios.get(
      "https://hf.space/embed/ronvolutional/ai-pokemon-card/new_card?pull=1&saved=0"
    );
    let creature = {
      name: data.details.name,
      description: data.details.description,
      hatcher: hatcher,
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
