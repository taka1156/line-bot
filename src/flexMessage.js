module.exports = {
  makeMassage({ title, updated_at, user_img, likes_count, url }) {
    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'Qiita',
            color: '#ffffff',
            size: 'xl',
            weight: 'bold',
          },
        ],
      },
      hero: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${updated_at}`,
            size: 'lg',
          },
        ],
        paddingStart: '20px',
      },
      body: {
        type: 'box',
        layout: 'horizontal',
        contents: [
          {
            type: 'image',
            url: `${user_img}`,
            aspectMode: 'cover',
            align: 'start',
            size: 'lg',
            flex: 2,
          },
          {
            type: 'text',
            text: `${title}`,
            wrap: true,
            size: 'md',
            maxLines: 100,
            align: 'start',
            gravity: 'center',
            flex: 6,
            margin: 'md',
          },
        ],
        flex: 12,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `GOOD(LGTM):${likes_count}`,
            align: 'end',
            size: 'lg',
          },
        ],
      },
      action: {
        type: 'uri',
        label: 'action',
        uri: `${url}`,
      },
      styles: {
        header: {
          backgroundColor: '#55C500',
          separator: true,
          separatorColor: '#696969',
        },
        body: {
          separator: true,
        },
        footer: {
          separator: true,
        },
      },
    };
  },
};
