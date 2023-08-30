use clap::Parser;

const DNS_SERVER: &str = "8.8.8.8:53";
/// Simple cli for testing dns lookups
#[derive(Parser, Debug)]
#[command(version, about, long_about = None)]
struct Args {
    /// Number of entries to try
    #[arg(short, long, default_value_t = 10)]
    count: u8,

    #[arg(short, long, default_value = DNS_SERVER)]
    dns_server: String,

    #[arg(last = true)]
    dns_names: Vec<String>,
}

fn main() {
    let args: Args = Args::parse();
    let _ = args.dns_names.len() >= 1 || panic!("No DNS names provided");
    println!("{:?}", args);

    let (mut lookup_tx, lookup_rx) = spmc::channel();

    for domain in args.dns_names {
        for d in generate_squatter_possibilities(domain) {
            lookup_tx.send(d).unwrap();
        }
    }

    while let Result::Ok(domain) = lookup_rx.recv() {
        println!(
            "Hello {}! resolves? {}",
            domain,
            domain_name_resolves(args.dns_server.to_owned(), domain.to_owned())
        );
    }
}

// Levenshtein distance
// soundex?

fn generate_squatter_possibilities(domain: String) -> Vec<String> {
    let mut p = Vec::new();
    p.push(format!("a{}", domain));
    return p;
}

#[test]
fn test_generate_squatter_possibilities() {
    let p = generate_squatter_possibilities("google.com".to_owned());
    assert!(p.len() > 0)
}

fn domain_name_resolves(server: String, domain: String) -> bool {
    // Do the look ups
    use std::str::FromStr;
    use trust_dns_client::client::{Client, SyncClient};
    use trust_dns_client::op::DnsResponse;
    use trust_dns_client::rr::{DNSClass, Name, Record, RecordType};
    use trust_dns_client::udp::UdpClientConnection;

    let address = server.parse().unwrap();
    let conn = UdpClientConnection::new(address).unwrap();

    // and then create the Client
    let client = SyncClient::new(conn);

    // Specify the name, note the final '.' which specifies it's an FQDN
    let name = Name::from_str(&format!("{}.", domain)).unwrap();

    // NOTE: see 'Setup a connection' example above
    // Send the query and get a message response, see RecordType for all supported options
    let response: DnsResponse = client.query(&name, DNSClass::IN, RecordType::A).unwrap();

    // Messages are the packets sent between client and server in DNS.
    //  there are many fields to a Message, DnsResponse can be dereferenced into
    //  a Message. It's beyond the scope of these examples
    //  to explain all the details of a Message. See trust_dns_client::op::message::Message for more details.
    //  generally we will be interested in the Message::answers
    let answers: &[Record] = response.answers();

    if answers.len() > 0 {
        return answers[0].data().is_some();
    } else {
        return false;
    }
    // Records are generic objects which can contain any data.
    //  In order to access it we need to first check what type of record it is
    //  In this case we are interested in A, IPv4 address
    //   if let Some(RData::A(ref ip)) = answers[0].data() {
    //       assert_eq!(*ip, A::new(93, 184, 216, 34))
    //   } else {
    //       assert!(false, "unexpected result")
    //   }
}

#[test]
fn test_good_resolution() {
    assert!(domain_name_resolves(DNS_SERVER.to_string(), "google.com".to_owned()))
}
#[test]
fn test_does_not_resolve() {
    assert!(
        !domain_name_resolves(DNS_SERVER.to_string(), "this-name-cant-really-exist.com".to_owned()),
        "this domain should never resolve"
    );
}
