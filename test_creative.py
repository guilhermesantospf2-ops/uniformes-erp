import json
import meta_ads_manager

pic = "https://scontent.ftow5-1.fna.fbcdn.net/v/t15.5256-10/858596670_1088757860824378_1012024318055655434_n.jpg?stp=dst-jpg_p160x160_tt6&_nc_cat=105&_nc_map=urlgen_bucketless&ccb=1-7&_nc_sid=200999&_nc_ohc=A6FROO5B1VUQ7kNvwGtl1kw&_nc_oc=AdpIW67H1MLm3BxwaaWk3wjvAVi_torXo_chYbqmznX9YIxIeQGYeog6sjKL-RmxkYU&_nc_zt=23&_nc_ht=scontent.ftow5-1.fna&edm=APRAPSkEAAAA&_nc_gid=e3YXbMN5OkHLmLCGt8O9aQ&_nc_tpa=Q5bMBQIIbfPZCyirjM-BcwzU_0gSJBeccc_njl4Gn-gF6mC-83O3szE1TMwalUIxe7PDe_tr8ui5_kxh&oh=00_AQM2gkZMKix2SyEPnJ0_0NEcd2iv5AGmipiG5JI0h5EPeA&oe=6ADEE916"

object_story = {
    'page_id': '320117504509859',
    'video_data': {
        'video_id': '1630493205207764',
        'image_url': pic,
        'title': 'Texfy ERP | Sistema para Confeccao de Uniformes',
        'message': 'Teste',
        'call_to_action': {
            'type': 'LEARN_MORE',
            'value': {
                'link': 'https://wa.me/554499856245'
            }
        }
    }
}

res = meta_ads_manager.meta_request(
    'act_2320262458814661/adcreatives',
    method='POST',
    data={
        'name': 'Criativo Video - Texfy ERP Teste',
        'object_story_spec': json.dumps(object_story)
    }
)
print("Resultado:", res)
