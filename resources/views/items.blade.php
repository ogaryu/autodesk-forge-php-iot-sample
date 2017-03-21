@if (count($items) > 0)
    <table class="table table-striped">
        <tbody>
        @foreach ($items as $item)
            <tr>
                <td class="table-text"><div>{{ $item['attributes']['displayName'] }}</div></td>
                
                <td class="table-btn">
                    @foreach ($derivatives as $derivative)
                        @if($item['id'] == $derivative['relationships']['item']['data']['id'])
                            @if($derivative['relationships']['derivatives']['data']['id'] != '')
                                <button type="button" class="btn btn-primary item_viewer" data-item-id={{ $item['id'] }} data-derivative-urn={{ $derivative['relationships']['derivatives']['data']['id'] }}>
                                    <i class="fa fa-cube"></i>View
                                </button>
                            @endif
                        @endif
                    @endforeach
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif