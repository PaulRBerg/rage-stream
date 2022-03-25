import { shouldBehaveLikeCreateStream } from "./effects/createStream";

export function shouldBehaveLikeMetaSablier(): void {
  describe("Effects", function () {
    describe("createStream", function () {
      shouldBehaveLikeCreateStream();
    });
  });
}
