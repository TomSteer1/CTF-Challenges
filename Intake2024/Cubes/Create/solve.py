import anvil
import nbt
from items import *
import json
import base64

copiedRegion = anvil.EmptyRegion(0, 0)

region = anvil.Region.from_file('r.0.0.mca')

tags = [[None for x in range(256)] for y in range(256)]
solution = ["" for x in range(100)]


for cX in range(16):
    for cY in range(16):
        chunk = region.get_chunk(cX, cY)
        te = chunk.tile_entities
        for tag in te:
            if 'minecraft:shulker_box' in tag['id']:
                x = tag['x'].value
                z = tag['z'].value
                tags[x][z] = tag

        
        for x in range(16):
            for z in range(16):
                blockX = cX*16 + x
                blockZ = cY*16 + z
                block = chunk.get_block(x, 2, z)
                if block.id == 'pink_shulker_box':
                    shulkerItems = tags[blockX][blockZ]['Items']
                    for item in shulkerItems:
                        if item['Slot'].value == 13:
                            itemTags = item['tag']
                            gen = itemTags['generation'].value
                            pages = itemTags['pages']
                            for page in pages:
                                # Parse json from page
                                pageText = json.loads(page.value)
                                if pageText['color'] == 'gold':
                                    solution[gen] = pageText['text']
                                    break


flag = ""
for s in solution:
    if s != "":
        for i in allGameItems:
            if i.displayName == s:
                flag += chr(i.id)
                break

print(flag)
print(base64.b64decode(flag).decode())
