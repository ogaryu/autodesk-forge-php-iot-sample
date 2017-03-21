@if (count($hubs) > 0)
    <table class="table table-striped">
        <tbody>
        @foreach ($hubs as $hub)
            <tr>
                <td class="table-text"><div>{{ $hub['attributes']['name'] }}</div></td>
                
                <td class="table-btn">
                    <form action="/projects/{{ $hub['id'] }}" method="GET" data-request-type="projects" class="ajaxform">
                        {{ csrf_field() }}
                        <button type="submit" class="btn btn-primary">
                            <i class="fa fa-tasks"></i>Projects
                        </button>
                    </form>
                </td>
            </tr>
        @endforeach
        </tbody>
    </table>
@endif